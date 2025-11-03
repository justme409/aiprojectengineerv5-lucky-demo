import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  LotNode,
  LOT_QUERIES,
  LotStatusEnum,
} from '@/schemas/neo4j/lot.schema';
import {
  createApiHandler,
} from '@/lib/api/neo4j-handler';
import { neo4jWriteOne } from '@/lib/api/neo4j-handler';

const UpdateStatusSchema = z.object({
  status: LotStatusEnum,
});

/**
 * PATCH /api/neo4j/[projectId]/lots/[lotId]/status
 * Update lot status
 */
export const PATCH = createApiHandler<z.infer<typeof UpdateStatusSchema>, LotNode>({
  schema: UpdateStatusSchema,
  handler: async ({ body, params }) => {
    const { projectId, lotId } = params;
    
    if (!projectId || !lotId) {
      throw new Error('Project ID and Lot number are required');
    }
    
    if (!body) {
      throw new Error('Request body is required');
    }
    
    const result = await neo4jWriteOne<LotNode>(
      LOT_QUERIES.updateLotStatus,
      {
        projectId,
        number: lotId,
        status: body.status,
      }
    );
    
    if (result.error) {
      throw new Error('Failed to update lot status');
    }
    
    if (!result.data) {
      throw new Error('Lot not found');
    }
    
    return result.data;
  },
});

