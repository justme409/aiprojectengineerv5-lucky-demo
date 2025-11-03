import { Suspense } from 'react';
import { ProgressClaimNode, PROGRESS_CLAIM_QUERIES } from '@/schemas/neo4j';
import { neo4jClient } from '@/lib/neo4j';
import { ProgressClaimsTable } from '@/components/progress/progress-claims-table';
import { ProgressClaimsTableSkeleton } from '@/components/progress/progress-claims-table-skeleton';
import { CreateProgressClaimButton } from '@/components/progress/create-progress-claim-button';

/**
 * Progress Claims Page
 * 
 * Displays all progress claims for a project.
 * Claims track monthly payment applications based on completed work.
 */

interface PageProps {
  params: Promise<{ projectId: string }>;
}

async function getProgressClaims(projectId: string): Promise<ProgressClaimNode[]> {
  try {
    return await neo4jClient.read<ProgressClaimNode>(
      PROGRESS_CLAIM_QUERIES.getAllClaims,
      { projectId }
    );
  } catch (error) {
    console.error('Failed to fetch progress claims:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch progress claims');
  }
}

async function ProgressClaimsContent({ projectId }: { projectId: string }) {
  const claims = await getProgressClaims(projectId);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Progress Claims</h1>
          <p className="text-muted-foreground mt-2">
            Monthly payment claims based on completed work
          </p>
        </div>
        <CreateProgressClaimButton projectId={projectId} />
      </div>
      
      <ProgressClaimsTable claims={claims} projectId={projectId} />
      
      {claims.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No progress claims found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a progress claim to track monthly payments
          </p>
        </div>
      )}
    </div>
  );
}

export default async function ProgressClaimsPage({ params }: PageProps) {
  const { projectId } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<ProgressClaimsTableSkeleton />}>
        <ProgressClaimsContent projectId={projectId} />
      </Suspense>
    </div>
  );
}

