import { NextRequest } from 'next/server';
import {
  LotNode,
  LOT_QUERIES,
  UpdateLotInputSchema,
  UpdateLotInput,
  LotWithRelationships,
} from '@/schemas/neo4j';
import {
  createApiHandler,
  errorResponse,
  successResponse,
  neo4jReadOne,
  neo4jWriteOne,
} from '@/lib/api/neo4j-handler';

/**
 * GET /api/neo4j/[projectId]/lots/[lotId]
 * Get lot detail with relationships
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; lotId: string }> }
) {
  const { projectId, lotId } = await params;
  
  if (!projectId || !lotId) {
    return errorResponse('Project ID and Lot number are required', 400);
  }
  
  const result = await neo4jReadOne<LotWithRelationships>(
    LOT_QUERIES.getLotDetail,
    { projectId, number: lotId }
  );
  
  if (result.error) {
    return result.error;
  }
  
  if (!result.data) {
    return errorResponse('Lot not found', 404);
  }
  
  return successResponse(result.data);
}

/**
 * PATCH /api/neo4j/[projectId]/lots/[lotId]
 * Update lot
 */
export const PATCH = createApiHandler<UpdateLotInput, LotNode>({
  schema: UpdateLotInputSchema,
  handler: async ({ body, params }) => {
    const { projectId, lotId } = params;
    
    if (!projectId || !lotId) {
      throw new Error('Project ID and Lot number are required');
    }
    
    if (!body) {
      throw new Error('Request body is required');
    }
    
    const result = await neo4jWriteOne<LotNode>(
      LOT_QUERIES.updateLot,
      {
        projectId,
        number: lotId,
        properties: body,
      }
    );
    
    if (result.error) {
      throw new Error('Failed to update lot');
    }
    
    if (!result.data) {
      throw new Error('Lot not found');
    }
    
    return result.data;
  },
});

/**
 * DELETE /api/neo4j/[projectId]/lots/[lotId]
 * Soft delete lot
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; lotId: string }> }
) {
  const { projectId, lotId } = await params;
  
  if (!projectId || !lotId) {
    return errorResponse('Project ID and Lot number are required', 400);
  }
  
  const result = await neo4jWriteOne<LotNode>(
    LOT_QUERIES.deleteLot,
    { projectId, number: lotId }
  );
  
  if (result.error) {
    return result.error;
  }
  
  if (!result.data) {
    return errorResponse('Lot not found', 404);
  }
  
  return successResponse(result.data);
}

