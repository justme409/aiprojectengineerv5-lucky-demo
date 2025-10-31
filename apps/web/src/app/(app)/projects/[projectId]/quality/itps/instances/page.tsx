import { Suspense } from 'react';
import { ITPInstanceNode, ITP_INSTANCE_QUERIES } from '@/schemas/neo4j/itp-instance.schema';
import { neo4jClient } from '@/lib/neo4j';
import { ITPInstancesTable } from '@/components/quality/itp-instances-table';
import { ITPInstancesTableSkeleton } from '@/components/quality/itp-instances-table-skeleton';
import { CreateITPInstanceButton } from '@/components/quality/create-itp-instance-button';

/**
 * ITP Instances Page
 * 
 * Displays all ITP instances for a project.
 * ITP instances are lot-specific implementations of ITP templates.
 */

interface PageProps {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<{ status?: string }>;
}

async function getITPInstances(
  projectId: string,
  filters: { status?: string }
): Promise<ITPInstanceNode[]> {
  try {
    let query = ITP_INSTANCE_QUERIES.getAllInstances;
    const params: Record<string, any> = { projectId };
    
    if (filters.status === 'in_progress') {
      query = ITP_INSTANCE_QUERIES.getInProgressInstances;
    }
    
    return await neo4jClient.read<ITPInstanceNode>(query, params);
  } catch (error) {
    console.error('Failed to fetch ITP instances:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch ITP instances');
  }
}

async function ITPInstancesContent({ projectId, filters }: { projectId: string; filters: { status?: string } }) {
  const instances = await getITPInstances(projectId, filters);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ITP Instances</h1>
          <p className="text-muted-foreground mt-2">
            Lot-specific ITP implementations with inspection points
          </p>
        </div>
        <CreateITPInstanceButton projectId={projectId} />
      </div>
      
      <ITPInstancesTable instances={instances} projectId={projectId} />
      
      {instances.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No ITP instances found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create ITP instances from templates for specific lots
          </p>
        </div>
      )}
    </div>
  );
}

export default async function ITPInstancesPage({ params, searchParams }: PageProps) {
  const [{ projectId }, filters] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({}),
  ]);

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<ITPInstancesTableSkeleton />}>
        <ITPInstancesContent projectId={projectId} filters={filters ?? {}} />
      </Suspense>
    </div>
  );
}

