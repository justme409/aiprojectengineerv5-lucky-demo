import { Suspense } from 'react';
import { NCRNode, NCR_QUERIES } from '@/schemas/neo4j/ncr.schema';
import { neo4jClient } from '@/lib/neo4j';
import { NCRsTable } from '@/components/quality/ncrs-table';
import { NCRsTableSkeleton } from '@/components/quality/ncrs-table-skeleton';
import { CreateNCRButton } from '@/components/quality/create-ncr-button';

/**
 * NCR Register Page
 * 
 * Displays all Non-Conformance Reports for a project.
 * NCRs track quality issues and their resolution.
 */

interface PageProps {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<{ status?: string; severity?: string }>;
}

async function getNCRs(
  projectId: string,
  filters: { status?: string; severity?: string }
): Promise<NCRNode[]> {
  try {
    let query = NCR_QUERIES.getAllNCRs;
    const params: Record<string, any> = { projectId };
    
    if (filters.status === 'open') {
      query = NCR_QUERIES.getOpenNCRs;
    }
    
    const ncrs = await neo4jClient.read<NCRNode>(query, params);

    if (filters.severity) {
      return ncrs.filter((ncr) => ncr.severity === filters.severity);
    }

    return ncrs;
  } catch (error) {
    console.error('Failed to fetch NCRs:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch NCRs');
  }
}

async function NCRsContent({ projectId, filters }: { projectId: string; filters: { status?: string; severity?: string } }) {
  const ncrs = await getNCRs(projectId, filters);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">NCR Register</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage non-conformance reports and quality issues
          </p>
        </div>
        <CreateNCRButton projectId={projectId} />
      </div>
      
      <NCRsTable ncrs={ncrs} projectId={projectId} />
      
      {ncrs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No NCRs found</p>
          <p className="text-sm text-muted-foreground mt-1">
            This is good - no quality issues reported!
          </p>
        </div>
      )}
    </div>
  );
}

export default async function NCRsPage({ params, searchParams }: PageProps) {
  const [{ projectId }, filters] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({}),
  ]);

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<NCRsTableSkeleton />}>
        <NCRsContent projectId={projectId} filters={filters ?? {}} />
      </Suspense>
    </div>
  );
}
