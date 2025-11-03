import { NextRequest } from 'next/server';
import {
  WBSNodeType,
  WBS_NODE_QUERIES,
} from '@/schemas/neo4j';
import {
  errorResponse,
  successResponse,
  neo4jRead,
  neo4jWriteOne,
} from '@/lib/api/neo4j-handler';

/**
 * GET /api/neo4j/[projectId]/wbs
 * Get all WBS nodes for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  
  if (!projectId) {
    return errorResponse('Project ID is required', 400);
  }
  
  const result = await neo4jRead<WBSNodeType>(
    WBS_NODE_QUERIES.getAllNodes,
    { projectId: projectId }
  );
  
  if (result.error) {
    return result.error;
  }
  
  return successResponse(result.data);
}

/**
 * POST /api/neo4j/[projectId]/wbs
 * Create a new WBS node
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
    
    const result = await neo4jWriteOne<WBSNodeType>(
      WBS_NODE_QUERIES.createNode,
      {
        properties: body,
        projectId: projectId,
      }
    );
    
    if (result.error) {
      return result.error;
    }
    
    if (!result.data) {
      return errorResponse('WBS node creation failed', 500);
    }
    
    return successResponse(result.data, 201);
  } catch (error) {
    console.error('Create WBS node error:', error);
    return errorResponse('Failed to create WBS node', 500);
  }
}

