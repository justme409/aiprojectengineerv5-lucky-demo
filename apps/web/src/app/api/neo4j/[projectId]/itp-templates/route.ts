import { NextRequest } from 'next/server';
import {
  ITPTemplateNode,
  ITP_TEMPLATE_QUERIES,
  CreateITPTemplateInputSchema,
  CreateITPTemplateInput,
} from '@/schemas/neo4j/itp-template.schema';
import {
  createApiHandler,
  errorResponse,
  successResponse,
  neo4jRead,
  neo4jWriteOne,
  getFilterParams,
} from '@/lib/api/neo4j-handler';

/**
 * GET /api/neo4j/[projectId]/itp-templates
 * Get all ITP templates for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;
  
  if (!projectId) {
    return errorResponse('Project ID is required', 400);
  }
  
  const filters = getFilterParams(request);
  const workType = filters.workType;
  const status = filters.status;
  
  let query = ITP_TEMPLATE_QUERIES.getAllTemplates;
  let queryParams: Record<string, any> = { projectId };
  
  if (workType) {
    query = ITP_TEMPLATE_QUERIES.getTemplatesByWorkType;
    queryParams.workType = workType;
  } else if (status === 'approved') {
    query = ITP_TEMPLATE_QUERIES.getApprovedTemplates;
  } else if (status === 'pending') {
    query = ITP_TEMPLATE_QUERIES.getTemplatesPendingApproval;
  }
  
  const result = await neo4jRead<ITPTemplateNode>(query, queryParams);
  
  if (result.error) {
    return result.error;
  }
  
  return successResponse(result.data);
}

/**
 * POST /api/neo4j/[projectId]/itp-templates
 * Create a new ITP template
 */
export const POST = createApiHandler<CreateITPTemplateInput, ITPTemplateNode>({
  schema: CreateITPTemplateInputSchema,
  handler: async ({ body, projectId }) => {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    if (!body) {
      throw new Error('Request body is required');
    }
    
    const result = await neo4jWriteOne<ITPTemplateNode>(
      ITP_TEMPLATE_QUERIES.createTemplate,
      {
        properties: body,
        projectId,
      }
    );
    
    if (result.error) {
      throw new Error('Failed to create ITP template');
    }
    
    if (!result.data) {
      throw new Error('ITP template creation returned no data');
    }
    
    return result.data;
  },
});

