import { NextRequest } from 'next/server';
import {
  InspectionPointNode,
  INSPECTION_POINT_QUERIES,
} from '@/schemas/neo4j/inspection-point.schema';
import {
  errorResponse,
  successResponse,
  neo4jRead,
  neo4jWriteOne,
} from '@/lib/api/neo4j-handler';

/**
 * GET /api/neo4j/[projectId]/inspection-points
 * Get all inspection points for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;
  
  if (!projectId) {
    return errorResponse('Project ID is required', 400);
  }
  
  const result = await neo4jRead<InspectionPointNode>(
    INSPECTION_POINT_QUERIES.getAllPoints,
    { projectId }
  );
  
  if (result.error) {
    return result.error;
  }
  
  return successResponse(result.data);
}

/**
 * POST /api/neo4j/[projectId]/inspection-points
 * Create a new inspection point
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
    
    if (!body.itpInstanceId) {
      return errorResponse('ITP Instance ID is required', 400);
    }
    
    const result = await neo4jWriteOne<InspectionPointNode>(
      INSPECTION_POINT_QUERIES.createPoint,
      {
        properties: body,
        itpInstanceId: body.itpInstanceId,
      }
    );
    
    if (result.error) {
      return result.error;
    }
    
    if (!result.data) {
      return errorResponse('Inspection point creation failed', 500);
    }
    
    return successResponse(result.data, 201);
  } catch (error) {
    console.error('Create inspection point error:', error);
    return errorResponse('Failed to create inspection point', 500);
  }
}

