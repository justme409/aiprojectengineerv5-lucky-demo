import { NextRequest } from 'next/server';
import {
  ITPInstanceNode,
  ITP_INSTANCE_QUERIES,
} from '@/schemas/neo4j/itp-instance.schema';
import {
  errorResponse,
  successResponse,
  neo4jRead,
  neo4jWriteOne,
} from '@/lib/api/neo4j-handler';

/**
 * GET /api/neo4j/[projectId]/itp-instances
 * Get all ITP instances for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  
  if (!projectId) {
    return errorResponse('Project ID is required', 400);
  }
  
  const result = await neo4jRead<ITPInstanceNode>(
    ITP_INSTANCE_QUERIES.getAllInstances,
    { projectId }
  );
  
  if (result.error) {
    return result.error;
  }
  
  return successResponse(result.data);
}

/**
 * POST /api/neo4j/[projectId]/itp-instances
 * Create a new ITP instance
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
    
    if (!body.templateId || !body.lotId) {
      return errorResponse('Template ID and Lot ID are required', 400);
    }
    
    const result = await neo4jWriteOne<ITPInstanceNode>(
      ITP_INSTANCE_QUERIES.createInstance,
      {
        properties: body,
        templateId: body.templateId,
        lotId: body.lotId,
      }
    );
    
    if (result.error) {
      return result.error;
    }
    
    if (!result.data) {
      return errorResponse('ITP instance creation failed', 500);
    }
    
    return successResponse(result.data, 201);
  } catch (error) {
    console.error('Create ITP instance error:', error);
    return errorResponse('Failed to create ITP instance', 500);
  }
}

