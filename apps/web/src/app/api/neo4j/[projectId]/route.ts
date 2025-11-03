import { NextRequest } from 'next/server';
import {
  ProjectNode,
  PROJECT_QUERIES,
} from '@/schemas/neo4j/project.schema';
import {
  errorResponse,
  successResponse,
  neo4jRead,
} from '@/lib/api/neo4j-handler';

/**
 * GET /api/neo4j/[projectId]
 * Get project details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  
  if (!projectId) {
    return errorResponse('Project ID is required', 400);
  }
  
  const result = await neo4jRead<{ project: ProjectNode }>(
    PROJECT_QUERIES.getProject,
    { projectId: projectId }
  );
  
  if (result.error) {
    return result.error;
  }
  
  const project = result.data?.[0]?.project;
  
  if (!project) {
    return errorResponse('Project not found', 404);
  }
  
  return successResponse(project);
}

