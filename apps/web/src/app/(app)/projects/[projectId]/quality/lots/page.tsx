import { Suspense } from 'react';
import { LotNode, LOT_QUERIES } from '@/schemas/neo4j/lot.schema';
import { neo4jClient } from '@/lib/neo4j';
import { LotsTable } from '@/components/quality/lots-table';
import { LotsTableSkeleton } from '@/components/quality/lots-table-skeleton';
import { CreateLotButton } from '@/components/quality/create-lot-button';

/**
 * Lot Register Page
 * 
 * Displays all lots for a project with filtering and search.
 * Data is fetched server-side from Neo4j.
 */

interface PageProps {
  params: { projectId: string };
  searchParams: { status?: string; workType?: string };
}

async function getProjectLots(
  projectId: string,
  filters: { status?: string; workType?: string }
): Promise<LotNode[]> {
  try {
    let query = LOT_QUERIES.getAllLots;
    let params: Record<string, any> = { projectId };
    
    if (filters.status) {
      query = LOT_QUERIES.getLotsByStatus;
      params.status = filters.status;
    } else if (filters.workType) {
      query = LOT_QUERIES.getLotsByWorkType;
      params.workType = filters.workType;
    }
    
    const lots = await neo4jClient.read<LotNode>(query, params);
    return lots;
  } catch (error) {
    console.error('Failed to fetch lots:', error);
    return [];
  }
}

async function LotsContent({ projectId, filters }: { projectId: string; filters: PageProps['searchParams'] }) {
  const lots = await getProjectLots(projectId, filters);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lot Register</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage construction lots for quality control
          </p>
        </div>
        <CreateLotButton projectId={projectId} />
      </div>
      
      <LotsTable lots={lots} projectId={projectId} />
      
      {lots.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No lots found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first lot or upload a specification document for the agent to extract lots
          </p>
        </div>
      )}
    </div>
  );
}

export default function LotsPage({ params, searchParams }: PageProps) {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<LotsTableSkeleton />}>
        <LotsContent projectId={params.projectId} filters={searchParams} />
      </Suspense>
    </div>
  );
}

