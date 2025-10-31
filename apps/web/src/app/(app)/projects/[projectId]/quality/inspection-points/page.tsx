import { Suspense } from 'react';
import { InspectionPointNode, INSPECTION_POINT_QUERIES } from '@/schemas/neo4j/inspection-point.schema';
import { neo4jClient } from '@/lib/neo4j';
import { InspectionPointsTable } from '@/components/quality/inspection-points-table';
import { InspectionPointsTableSkeleton } from '@/components/quality/inspection-points-table-skeleton';

/**
 * Inspection Points Page
 * 
 * Displays all inspection points across all ITP instances.
 * Shows hold points, witness points, and surveillance points.
 */

interface PageProps {
  params: { projectId: string };
  searchParams: { status?: string; type?: string };
}

async function getInspectionPoints(
  projectId: string,
  filters: { status?: string; type?: string }
): Promise<InspectionPointNode[]> {
  try {
    let query = INSPECTION_POINT_QUERIES.getAllPoints;
    const params: Record<string, any> = { projectId };
    
    if (filters.status === 'pending') {
      query = INSPECTION_POINT_QUERIES.getPendingPoints;
    } else if (filters.type === 'hold') {
      query = INSPECTION_POINT_QUERIES.getHoldPoints;
    }
    
    const points = await neo4jClient.read<InspectionPointNode>(query, params);
    return points;
  } catch (error) {
    console.error('Failed to fetch inspection points:', error);
    return [];
  }
}

async function InspectionPointsContent({ projectId, filters }: { projectId: string; filters: PageProps['searchParams'] }) {
  const points = await getInspectionPoints(projectId, filters);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inspection Points</h1>
          <p className="text-muted-foreground mt-2">
            Hold points, witness points, and surveillance points across all ITPs
          </p>
        </div>
      </div>
      
      <InspectionPointsTable points={points} projectId={projectId} />
      
      {points.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No inspection points found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Inspection points are created from ITP instances
          </p>
        </div>
      )}
    </div>
  );
}

export default function InspectionPointsPage({ params, searchParams }: PageProps) {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<InspectionPointsTableSkeleton />}>
        <InspectionPointsContent projectId={params.projectId} filters={searchParams} />
      </Suspense>
    </div>
  );
}

