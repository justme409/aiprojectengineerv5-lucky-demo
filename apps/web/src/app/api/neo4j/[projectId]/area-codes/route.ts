import { NextRequest } from 'next/server';
import {
  AreaCodeNode,
  AREA_CODE_QUERIES,
} from '@/schemas/neo4j/area-code.schema';
import {
  errorResponse,
  successResponse,
  neo4jRead,
  neo4jWriteOne,
} from '@/lib/api/neo4j-handler';

/**
 * GET /api/neo4j/[projectId]/area-codes
 * Get all area codes for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  
  if (!projectId) {
    return errorResponse('Project ID is required', 400);
  }
  
  const result = await neo4jRead<AreaCodeNode>(
    AREA_CODE_QUERIES.getAllAreaCodes,
    { projectId }
  );
  
  if (result.error) {
    return result.error;
  }
  
  return successResponse(result.data);
}

/**
 * POST /api/neo4j/[projectId]/area-codes
 * Create a new area code
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
    
    const result = await neo4jWriteOne<AreaCodeNode>(
      AREA_CODE_QUERIES.createAreaCode,
      {
        properties: body,
        projectId,
      }
    );
    
    if (result.error) {
      return result.error;
    }
    
    if (!result.data) {
      return errorResponse('Area code creation failed', 500);
    }
    
    return successResponse(result.data, 201);
  } catch (error) {
    console.error('Create area code error:', error);
    return errorResponse('Failed to create area code', 500);
  }
}

