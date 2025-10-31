import { NextRequest } from 'next/server';
import {
  ProgressClaimNode,
  PROGRESS_CLAIM_QUERIES,
} from '@/schemas/neo4j/progress-claim.schema';
import {
  errorResponse,
  successResponse,
  neo4jRead,
  neo4jWriteOne,
} from '@/lib/api/neo4j-handler';

/**
 * GET /api/neo4j/[projectId]/claims
 * Get all progress claims for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  
  if (!projectId) {
    return errorResponse('Project ID is required', 400);
  }
  
  const result = await neo4jRead<ProgressClaimNode>(
    PROGRESS_CLAIM_QUERIES.getAllClaims,
    { projectId }
  );
  
  if (result.error) {
    return result.error;
  }
  
  return successResponse(result.data);
}

/**
 * POST /api/neo4j/[projectId]/claims
 * Create a new progress claim
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
    
    const result = await neo4jWriteOne<ProgressClaimNode>(
      PROGRESS_CLAIM_QUERIES.createClaim,
      {
        properties: body,
        projectId,
      }
    );
    
    if (result.error) {
      return result.error;
    }
    
    if (!result.data) {
      return errorResponse('Progress claim creation failed', 500);
    }
    
    return successResponse(result.data, 201);
  } catch (error) {
    console.error('Create progress claim error:', error);
    return errorResponse('Failed to create progress claim', 500);
  }
}

