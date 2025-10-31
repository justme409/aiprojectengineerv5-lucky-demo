import { Suspense } from 'react';
import { QuantityNode } from '@/schemas/neo4j/quantity.schema';
import { LotNode, LOT_QUERIES } from '@/schemas/neo4j/lot.schema';
import { neo4jClient } from '@/lib/neo4j';
import { QuantitiesTable } from '@/components/quality/quantities-table';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * Lot Quantities Page
 * 
 * Displays quantities for a specific lot linked to schedule items.
 * Used for progress claims and payment tracking.
 */

interface PageProps {
  params: { projectId: string; lotId: string };
}

async function getLotWithQuantities(lotId: string): Promise<{ lot: LotNode; quantities: QuantityNode[] } | null> {
  try {
    const result = await neo4jClient.readOne<any>(
      LOT_QUERIES.getLotDetail,
      { lotId }
    );
    
    if (!result) return null;
    
    return {
      lot: result.l,
      quantities: result.quantities || [],
    };
  } catch (error) {
    console.error('Failed to fetch lot quantities:', error);
    return null;
  }
}

async function LotQuantitiesContent({ projectId, lotId }: { projectId: string; lotId: string }) {
  const data = await getLotWithQuantities(lotId);
  
  if (!data) {
    return <div>Lot not found</div>;
  }
  
  const { lot, quantities } = data;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          asChild
        >
          <Link href={`/projects/${projectId}/quality/lots/${lotId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lot
          </Link>
        </Button>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lot Quantities</h1>
        <p className="text-muted-foreground mt-2">
          {lot.number} - {lot.description}
        </p>
      </div>
      
      <QuantitiesTable quantities={quantities} projectId={projectId} lotId={lotId} />
      
      {quantities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
          <p className="text-muted-foreground">No quantities defined for this lot</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add quantities to link this lot to schedule items for progress claims
          </p>
        </div>
      )}
    </div>
  );
}

function LotQuantitiesSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="rounded-md border p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function LotQuantitiesPage({ params }: PageProps) {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<LotQuantitiesSkeleton />}>
        <LotQuantitiesContent projectId={params.projectId} lotId={params.lotId} />
      </Suspense>
    </div>
  );
}

