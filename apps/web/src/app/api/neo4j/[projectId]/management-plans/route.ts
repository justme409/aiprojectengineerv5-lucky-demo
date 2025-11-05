import { NextRequest } from 'next/server';
import {
  ManagementPlanNode,
  MANAGEMENT_PLAN_QUERIES,
  CreateManagementPlanInputSchema,
} from '@/schemas/neo4j';
import {
  errorResponse,
  successResponse,
  neo4jRead,
  neo4jWriteOne,
} from '@/lib/api/neo4j-handler';

/**
 * GET /api/neo4j/[projectId]/management-plans
 * Get all management plans for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  
  if (!projectId) {
    return errorResponse('Project ID is required', 400);
  }
  
  const result = await neo4jRead<ManagementPlanNode>(
    MANAGEMENT_PLAN_QUERIES.getAllPlans,
    { projectId: projectId }
  );
  
  if (result.error) {
    return result.error;
  }
  
  return successResponse(result.data);
}

/**
 * POST /api/neo4j/[projectId]/management-plans
 * Create a new management plan
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
    const parsed = CreateManagementPlanInputSchema.safeParse(body);

    if (!parsed.success) {
      console.error('Invalid management plan payload:', parsed.error);
      return errorResponse('Invalid management plan payload', 422);
    }

    const payload = {
      ...parsed.data,
      approvedDate: parsed.data.approvedDate ? parsed.data.approvedDate.toISOString() : undefined,
    };

    const result = await neo4jWriteOne<ManagementPlanNode>(
      MANAGEMENT_PLAN_QUERIES.createPlan,
      {
        properties: payload,
        projectId: projectId,
      }
    );
    
    if (result.error) {
      return result.error;
    }
    
    if (!result.data) {
      return errorResponse('Management plan creation failed', 500);
    }
    
    return successResponse(result.data, 201);
  } catch (error) {
    console.error('Create management plan error:', error);
    return errorResponse('Failed to create management plan', 500);
  }
}

