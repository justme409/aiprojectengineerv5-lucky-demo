import { NextRequest } from 'next/server';
import {
  NCRNode,
  NCR_QUERIES,
  CreateNCRInputSchema,
  CreateNCRInput,
} from '@/schemas/neo4j/ncr.schema';
import {
  createApiHandler,
  errorResponse,
  successResponse,
  neo4jRead,
  neo4jWriteOne,
  getFilterParams,
} from '@/lib/api/neo4j-handler';

/**
 * GET /api/neo4j/[projectId]/ncrs
 * Get all NCRs for a project
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
  
  let query = NCR_QUERIES.getAllNCRs;
  const queryParams: Record<string, any> = { projectId: projectId };
  
  if (status === 'open') {
    query = NCR_QUERIES.getOpenNCRs;
  }
  
  const result = await neo4jRead<NCRNode>(query, queryParams);
  
  if (result.error) {
    return result.error;
  }
  
  return successResponse(result.data);
}

/**
 * POST /api/neo4j/[projectId]/ncrs
 * Create a new NCR
 */
export const POST = createApiHandler<CreateNCRInput, NCRNode>({
  schema: CreateNCRInputSchema,
  handler: async ({ body, projectId }) => {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    if (!body) {
      throw new Error('Request body is required');
    }
    
    // NCR must be linked to a lot
    if (!body.lotNumber) {
      throw new Error('Lot number is required for NCR');
    }
    
    const result = await neo4jWriteOne<NCRNode>(
      NCR_QUERIES.createNCR,
      {
        properties: body,
        projectId: projectId,
        lotNumber: body.lotNumber,
      }
    );
    
    if (result.error) {
      throw new Error('Failed to create NCR');
    }
    
    if (!result.data) {
      throw new Error('NCR creation returned no data');
    }
    
    return result.data;
  },
});

