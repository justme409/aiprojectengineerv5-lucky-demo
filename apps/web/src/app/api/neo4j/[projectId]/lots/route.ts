import { NextRequest } from 'next/server';
import {
  LotNode,
  LOT_QUERIES,
  CreateLotInputSchema,
  CreateLotInput,
} from '@/schemas/neo4j/lot.schema';
import {
  createApiHandler,
  errorResponse,
  successResponse,
  neo4jRead,
  neo4jWriteOne,
  getPaginationParams,
  getFilterParams,
} from '@/lib/api/neo4j-handler';

/**
 * GET /api/neo4j/[projectId]/lots
 * Get all lots for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;
  
  if (!projectId) {
    return errorResponse('Project ID is required', 400);
  }
  
  // Get filters
  const filters = getFilterParams(request);
  const status = filters.status;
  const workType = filters.workType;
  
  // Choose query based on filters
  let query = LOT_QUERIES.getAllLots;
  let queryParams: Record<string, any> = { projectId };
  
  if (status) {
    query = LOT_QUERIES.getLotsByStatus;
    queryParams.status = status;
  } else if (workType) {
    query = LOT_QUERIES.getLotsByWorkType;
    queryParams.workType = workType;
  }
  
  const result = await neo4jRead<LotNode>(query, queryParams);
  
  if (result.error) {
    return result.error;
  }
  
  return successResponse(result.data);
}

/**
 * POST /api/neo4j/[projectId]/lots
 * Create a new lot
 */
export const POST = createApiHandler<CreateLotInput, LotNode>({
  schema: CreateLotInputSchema,
  handler: async ({ body, projectId }) => {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    if (!body) {
      throw new Error('Request body is required');
    }
    
    const result = await neo4jWriteOne<LotNode>(
      LOT_QUERIES.createLot,
      {
        properties: body,
        projectId,
      }
    );
    
    if (result.error) {
      throw new Error('Failed to create lot');
    }
    
    if (!result.data) {
      throw new Error('Lot creation returned no data');
    }
    
    return result.data;
  },
});

