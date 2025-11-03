import { NextRequest } from 'next/server';
import {
  TestMethodNode,
  TEST_METHOD_QUERIES,
} from '@/schemas/neo4j';
import {
  errorResponse,
  successResponse,
  neo4jRead,
  neo4jWriteOne,
} from '@/lib/api/neo4j-handler';

/**
 * GET /api/neo4j/[projectId]/test-methods
 * Get all test methods for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  
  if (!projectId) {
    return errorResponse('Project ID is required', 400);
  }
  
  const result = await neo4jRead<TestMethodNode>(
    TEST_METHOD_QUERIES.getAllMethods,
    { projectId: projectId }
  );
  
  if (result.error) {
    return result.error;
  }
  
  return successResponse(result.data);
}

/**
 * POST /api/neo4j/[projectId]/test-methods
 * Create a new test method
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
    
    const result = await neo4jWriteOne<TestMethodNode>(
      TEST_METHOD_QUERIES.createMethod,
      {
        properties: body,
        projectId: projectId,
      }
    );
    
    if (result.error) {
      return result.error;
    }
    
    if (!result.data) {
      return errorResponse('Test method creation failed', 500);
    }
    
    return successResponse(result.data, 201);
  } catch (error) {
    console.error('Create test method error:', error);
    return errorResponse('Failed to create test method', 500);
  }
}

