import { NextRequest } from 'next/server';
import {
  LotNode,
  LOT_QUERIES,
  UpdateLotInputSchema,
  UpdateLotInput,
  LotWithRelationships,
} from '@/schemas/neo4j/lot.schema';
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
  const { lotId } = await params;
  
  if (!lotId) {
    return errorResponse('Lot ID is required', 400);
  }
  
  const result = await neo4jReadOne<LotWithRelationships>(
    LOT_QUERIES.getLotDetail,
    { lotId }
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
    const { lotId } = params;
    
    if (!lotId) {
      throw new Error('Lot ID is required');
    }
    
    if (!body) {
      throw new Error('Request body is required');
    }
    
    const result = await neo4jWriteOne<LotNode>(
      LOT_QUERIES.updateLot,
      {
        lotId,
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
  const { lotId } = params;
  
  if (!lotId) {
    return errorResponse('Lot ID is required', 400);
  }
  
  const result = await neo4jWriteOne<LotNode>(
    LOT_QUERIES.deleteLot,
    { lotId }
  );
  
  if (result.error) {
    return result.error;
  }
  
  if (!result.data) {
    return errorResponse('Lot not found', 404);
  }
  
  return successResponse(result.data);
}

