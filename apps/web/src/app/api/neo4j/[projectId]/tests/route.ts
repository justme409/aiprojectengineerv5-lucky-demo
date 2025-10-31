import { NextRequest } from 'next/server';
import {
  TestRequestNode,
  TEST_REQUEST_QUERIES,
} from '@/schemas/neo4j/test-request.schema';
import {
  errorResponse,
  successResponse,
  neo4jRead,
  neo4jWriteOne,
  getFilterParams,
} from '@/lib/api/neo4j-handler';

/**
 * GET /api/neo4j/[projectId]/tests
 * Get all test requests for a project
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
  
  let query = TEST_REQUEST_QUERIES.getAllTests;
  const queryParams: Record<string, any> = { projectId };
  
  if (status === 'pending') {
    query = TEST_REQUEST_QUERIES.getPendingTests;
  }
  
  const result = await neo4jRead<TestRequestNode>(query, queryParams);
  
  if (result.error) {
    return result.error;
  }
  
  return successResponse(result.data);
}

/**
 * POST /api/neo4j/[projectId]/tests
 * Create a new test request
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
    
    if (!body.lotId) {
      return errorResponse('Lot ID is required', 400);
    }
    
    const result = await neo4jWriteOne<TestRequestNode>(
      TEST_REQUEST_QUERIES.createTest,
      {
        properties: body,
        lotId: body.lotId,
      }
    );
    
    if (result.error) {
      return result.error;
    }
    
    if (!result.data) {
      return errorResponse('Test request creation failed', 500);
    }
    
    return successResponse(result.data, 201);
  } catch (error) {
    console.error('Create test error:', error);
    return errorResponse('Failed to create test request', 500);
  }
}

