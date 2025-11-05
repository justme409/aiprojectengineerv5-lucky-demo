import { NextRequest } from 'next/server';
import {
  VariationNode,
  VARIATION_QUERIES,
  CreateVariationInputSchema,
} from '@/schemas/neo4j';
import {
  errorResponse,
  successResponse,
  neo4jRead,
  neo4jWriteOne,
} from '@/lib/api/neo4j-handler';

/**
 * GET /api/neo4j/[projectId]/variations
 * Get all variations for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  
  if (!projectId) {
    return errorResponse('Project ID is required', 400);
  }
  
  const result = await neo4jRead<VariationNode>(
    VARIATION_QUERIES.getAllVariations,
    { projectId: projectId }
  );
  
  if (result.error) {
    return result.error;
  }
  
  return successResponse(result.data);
}

/**
 * POST /api/neo4j/[projectId]/variations
 * Create a new variation
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
    const parsed = CreateVariationInputSchema.safeParse(body);

    if (!parsed.success) {
      console.error('Invalid variation payload:', parsed.error);
      return errorResponse('Invalid variation payload', 422);
    }

    const payload = {
      ...parsed.data,
      dateIdentified: parsed.data.dateIdentified.toISOString(),
      dateNotified: parsed.data.dateNotified ? parsed.data.dateNotified.toISOString() : undefined,
    };

    const result = await neo4jWriteOne<VariationNode>(
      VARIATION_QUERIES.createVariation,
      {
        properties: payload,
        projectId: projectId,
      }
    );
    
    if (result.error) {
      return result.error;
    }
    
    if (!result.data) {
      return errorResponse('Variation creation failed', 500);
    }
    
    return successResponse(result.data, 201);
  } catch (error) {
    console.error('Create variation error:', error);
    return errorResponse('Failed to create variation', 500);
  }
}

