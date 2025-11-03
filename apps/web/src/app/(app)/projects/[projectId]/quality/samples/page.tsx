import { Suspense } from 'react';
import { SampleNode, SAMPLE_QUERIES } from '@/schemas/neo4j';
import { neo4jClient } from '@/lib/neo4j';
import { SamplesTable } from '@/components/quality/samples-table';
import { SamplesTableSkeleton } from '@/components/quality/samples-table-skeleton';
import { CreateSampleButton } from '@/components/quality/create-sample-button';

/**
 * Samples Register Page
 * 
 * Displays all samples for a project.
 * Samples track physical specimens taken for testing.
 */

interface PageProps {
  params: Promise<{ projectId: string }>;
}

async function getSamples(projectId: string): Promise<SampleNode[]> {
  try {
    return await neo4jClient.read<SampleNode>(
      SAMPLE_QUERIES.getAllSamples,
      { projectId }
    );
  } catch (error) {
    console.error('Failed to fetch samples:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch samples');
  }
}

async function SamplesContent({ projectId }: { projectId: string }) {
  const samples = await getSamples(projectId);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Samples Register</h1>
          <p className="text-muted-foreground mt-2">
            Track physical samples taken for laboratory testing
          </p>
        </div>
        <CreateSampleButton projectId={projectId} />
      </div>
      
      <SamplesTable samples={samples} projectId={projectId} />
      
      {samples.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No samples found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Record samples taken from site for testing
          </p>
        </div>
      )}
    </div>
  );
}

export default async function SamplesPage({ params }: PageProps) {
  const { projectId } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<SamplesTableSkeleton />}>
        <SamplesContent projectId={projectId} />
      </Suspense>
    </div>
  );
}

