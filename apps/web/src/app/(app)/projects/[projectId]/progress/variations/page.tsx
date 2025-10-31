import { Suspense } from 'react';
import { VariationNode, VARIATION_QUERIES } from '@/schemas/neo4j/variation.schema';
import { neo4jClient } from '@/lib/neo4j';
import { VariationsTable } from '@/components/progress/variations-table';
import { VariationsTableSkeleton } from '@/components/progress/variations-table-skeleton';
import { CreateVariationButton } from '@/components/progress/create-variation-button';

/**
 * Variations Register Page
 * 
 * Displays all contract variations for a project.
 * Variations track changes to the contract scope and value.
 */

interface PageProps {
  params: Promise<{ projectId: string }>;
}

async function getVariations(projectId: string): Promise<VariationNode[]> {
  try {
    return await neo4jClient.read<VariationNode>(
      VARIATION_QUERIES.getAllVariations,
      { projectId }
    );
  } catch (error) {
    console.error('Failed to fetch variations:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch variations');
  }
}

async function VariationsContent({ projectId }: { projectId: string }) {
  const variations = await getVariations(projectId);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Variations Register</h1>
          <p className="text-muted-foreground mt-2">
            Track contract variations and change orders
          </p>
        </div>
        <CreateVariationButton projectId={projectId} />
      </div>
      
      <VariationsTable variations={variations} projectId={projectId} />
      
      {variations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No variations found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a variation to track contract changes
          </p>
        </div>
      )}
    </div>
  );
}

export default async function VariationsPage({ params }: PageProps) {
  const { projectId } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<VariationsTableSkeleton />}>
        <VariationsContent projectId={projectId} />
      </Suspense>
    </div>
  );
}

