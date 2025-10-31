import { Suspense } from 'react';
import { MixDesignNode, MIX_DESIGN_QUERIES } from '@/schemas/neo4j/mix-design.schema';
import { neo4jClient } from '@/lib/neo4j';
import { MixDesignsTable } from '@/components/quality/mix-designs-table';
import { MixDesignsTableSkeleton } from '@/components/quality/mix-designs-table-skeleton';
import { CreateMixDesignButton } from '@/components/quality/create-mix-design-button';

/**
 * Mix Designs Register Page
 * 
 * Displays all mix designs for a project.
 * Mix designs define concrete/asphalt compositions and proportions.
 */

interface PageProps {
  params: { projectId: string };
  searchParams: { status?: string };
}

async function getMixDesigns(
  projectId: string,
  filters: { status?: string }
): Promise<MixDesignNode[]> {
  try {
    let query = MIX_DESIGN_QUERIES.getAllMixDesigns;
    const params: Record<string, any> = { projectId };
    
    if (filters.status === 'approved') {
      query = MIX_DESIGN_QUERIES.getApprovedMixDesigns;
    }
    
    const mixDesigns = await neo4jClient.read<MixDesignNode>(query, params);
    return mixDesigns;
  } catch (error) {
    console.error('Failed to fetch mix designs:', error);
    return [];
  }
}

async function MixDesignsContent({ projectId, filters }: { projectId: string; filters: PageProps['searchParams'] }) {
  const mixDesigns = await getMixDesigns(projectId, filters);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mix Designs Register</h1>
          <p className="text-muted-foreground mt-2">
            Approved concrete and asphalt mix designs with proportions
          </p>
        </div>
        <CreateMixDesignButton projectId={projectId} />
      </div>
      
      <MixDesignsTable mixDesigns={mixDesigns} projectId={projectId} />
      
      {mixDesigns.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No mix designs found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add mix designs for concrete or asphalt production
          </p>
        </div>
      )}
    </div>
  );
}

export default function MixDesignsPage({ params, searchParams }: PageProps) {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<MixDesignsTableSkeleton />}>
        <MixDesignsContent projectId={params.projectId} filters={searchParams} />
      </Suspense>
    </div>
  );
}

