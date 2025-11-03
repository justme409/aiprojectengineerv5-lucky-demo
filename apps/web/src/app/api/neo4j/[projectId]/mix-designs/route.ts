import { NextRequest } from 'next/server';
import {
  MixDesignNode,
  MIX_DESIGN_QUERIES,
} from '@/schemas/neo4j/mix-design.schema';
import {
  errorResponse,
  successResponse,
  neo4jRead,
  neo4jWriteOne,
  getFilterParams,
} from '@/lib/api/neo4j-handler';

/**
 * GET /api/neo4j/[projectId]/mix-designs
 * Get all mix designs for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  
  if (!projectId) {
    return errorResponse('Project ID is required', 400);
  }
  
  const filters = getFilterParams(request);
  const status = filters.status;
  
  let query = MIX_DESIGN_QUERIES.getAllMixDesigns;
  const queryParams: Record<string, any> = { projectId: projectId };
  
  if (status === 'approved') {
    query = MIX_DESIGN_QUERIES.getApprovedMixDesigns;
  }
  
  const result = await neo4jRead<MixDesignNode>(query, queryParams);
  
  if (result.error) {
    return result.error;
  }
  
  return successResponse(result.data);
}

/**
 * POST /api/neo4j/[projectId]/mix-designs
 * Create a new mix design
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  
  if (!projectId) {
    return errorResponse('Project ID is required', 400);
  }
  
  try {
    const body = await request.json();
    
    const result = await neo4jWriteOne<MixDesignNode>(
      MIX_DESIGN_QUERIES.createMixDesign,
      {
        properties: body,
        projectId: projectId,
      }
    );
    
    if (result.error) {
      return result.error;
    }
    
    if (!result.data) {
      return errorResponse('Mix design creation failed', 500);
    }
    
    return successResponse(result.data, 201);
  } catch (error) {
    console.error('Create mix design error:', error);
    return errorResponse('Failed to create mix design', 500);
  }
}

