import { NextRequest } from 'next/server';
import {
  SampleNode,
  SAMPLE_QUERIES,
} from '@/schemas/neo4j/sample.schema';
import {
  errorResponse,
  successResponse,
  neo4jRead,
  neo4jWriteOne,
} from '@/lib/api/neo4j-handler';

/**
 * GET /api/neo4j/[projectId]/samples
 * Get all samples for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;
  
  if (!projectId) {
    return errorResponse('Project ID is required', 400);
  }
  
  const result = await neo4jRead<SampleNode>(
    SAMPLE_QUERIES.getAllSamples,
    { projectId }
  );
  
  if (result.error) {
    return result.error;
  }
  
  return successResponse(result.data);
}

/**
 * POST /api/neo4j/[projectId]/samples
 * Create a new sample
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;
  
  if (!projectId) {
    return errorResponse('Project ID is required', 400);
  }
  
  try {
    const body = await request.json();
    
    if (!body.lotId) {
      return errorResponse('Lot ID is required', 400);
    }
    
    const result = await neo4jWriteOne<SampleNode>(
      SAMPLE_QUERIES.createSample,
      {
        properties: body,
        lotId: body.lotId,
      }
    );
    
    if (result.error) {
      return result.error;
    }
    
    if (!result.data) {
      return errorResponse('Sample creation failed', 500);
    }
    
    return successResponse(result.data, 201);
  } catch (error) {
    console.error('Create sample error:', error);
    return errorResponse('Failed to create sample', 500);
  }
}

