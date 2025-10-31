import { NextRequest } from 'next/server';
import {
  ScheduleItemNode,
  SCHEDULE_ITEM_QUERIES,
} from '@/schemas/neo4j/schedule-item.schema';
import {
  errorResponse,
  successResponse,
  neo4jRead,
  neo4jWriteOne,
} from '@/lib/api/neo4j-handler';

/**
 * GET /api/neo4j/[projectId]/schedule-items
 * Get all schedule items for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  
  if (!projectId) {
    return errorResponse('Project ID is required', 400);
  }
  
  const result = await neo4jRead<ScheduleItemNode>(
    SCHEDULE_ITEM_QUERIES.getAllItems,
    { projectId }
  );
  
  if (result.error) {
    return result.error;
  }
  
  return successResponse(result.data);
}

/**
 * POST /api/neo4j/[projectId]/schedule-items
 * Create a new schedule item
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
    
    const result = await neo4jWriteOne<ScheduleItemNode>(
      SCHEDULE_ITEM_QUERIES.createItem,
      {
        properties: body,
        projectId,
      }
    );
    
    if (result.error) {
      return result.error;
    }
    
    if (!result.data) {
      return errorResponse('Schedule item creation failed', 500);
    }
    
    return successResponse(result.data, 201);
  } catch (error) {
    console.error('Create schedule item error:', error);
    return errorResponse('Failed to create schedule item', 500);
  }
}

