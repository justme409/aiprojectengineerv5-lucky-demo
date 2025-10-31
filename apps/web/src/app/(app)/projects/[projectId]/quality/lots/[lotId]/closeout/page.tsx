import { Suspense } from 'react';
import { LotNode, LOT_QUERIES } from '@/schemas/neo4j/lot.schema';
import { neo4jClient } from '@/lib/neo4j';
import { CloseoutChecklist } from '@/components/quality/closeout-checklist';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Lot Closeout Page
 * 
 * Displays closeout checklist and requirements for a lot.
 * Ensures all documentation and approvals are complete before closing.
 */

interface PageProps {
  params: Promise<{ projectId: string; lotId: string }>;
}

async function getLot(lotId: string): Promise<LotNode | null> {
  try {
    const result = await neo4jClient.readOne<any>(
      LOT_QUERIES.getLotDetail,
      { lotId }
    );
    
    if (!result) return null;
    
    return result.l;
  } catch (error) {
    console.error('Failed to fetch lot:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch lot');
  }
}

async function LotCloseoutContent({ projectId, lotId }: { projectId: string; lotId: string }) {
  const lot = await getLot(lotId);
  
  if (!lot) {
    return <div>Lot not found</div>;
  }
  
  const canClose = lot.status === 'conformed' && lot.percentComplete === 100;
  
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
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lot Closeout</h1>
          <p className="text-muted-foreground mt-2">
            {lot.number} - {lot.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={lot.status === 'closed' ? 'success' : 'default'}>
            {lot.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <Badge variant={lot.percentComplete === 100 ? 'success' : 'secondary'}>
            {lot.percentComplete}% Complete
          </Badge>
        </div>
      </div>
      
      {lot.status === 'closed' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900">Lot Closed</h3>
          <p className="text-sm text-green-700 mt-1">
            This lot was closed on {lot.closedDate ? new Date(lot.closedDate).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      )}
      
      {!canClose && lot.status !== 'closed' && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-900">Cannot Close Yet</h3>
          <p className="text-sm text-yellow-700 mt-1">
            Lot must be conformed and 100% complete before closeout.
          </p>
        </div>
      )}
      
      <CloseoutChecklist lot={lot} projectId={projectId} />
    </div>
  );
}

function LotCloseoutSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export default async function LotCloseoutPage({ params }: PageProps) {
  const { projectId, lotId } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<LotCloseoutSkeleton />}>
        <LotCloseoutContent projectId={projectId} lotId={lotId} />
      </Suspense>
    </div>
  );
}

