import { NextRequest } from 'next/server';
import {
  MaterialNode,
  MATERIAL_QUERIES,
} from '@/schemas/neo4j/material.schema';
import {
  errorResponse,
  successResponse,
  neo4jRead,
  neo4jWriteOne,
  getFilterParams,
} from '@/lib/api/neo4j-handler';

/**
 * GET /api/neo4j/[projectId]/materials
 * Get all materials for a project
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
  const status = filters.status;
  
  let query = MATERIAL_QUERIES.getAllMaterials;
  const queryParams: Record<string, any> = { projectId };
  
  if (status === 'approved') {
    query = MATERIAL_QUERIES.getApprovedMaterials;
  }
  
  const result = await neo4jRead<MaterialNode>(query, queryParams);
  
  if (result.error) {
    return result.error;
  }
  
  return successResponse(result.data);
}

/**
 * POST /api/neo4j/[projectId]/materials
 * Create a new material
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
    
    const result = await neo4jWriteOne<MaterialNode>(
      MATERIAL_QUERIES.createMaterial,
      {
        properties: body,
        projectId,
      }
    );
    
    if (result.error) {
      return result.error;
    }
    
    if (!result.data) {
      return errorResponse('Material creation failed', 500);
    }
    
    return successResponse(result.data, 201);
  } catch (error) {
    console.error('Create material error:', error);
    return errorResponse('Failed to create material', 500);
  }
}

