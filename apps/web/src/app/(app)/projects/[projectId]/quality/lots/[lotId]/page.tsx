import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { LotWithRelationships, LOT_QUERIES } from '@/schemas/neo4j';
import { neo4jClient } from '@/lib/neo4j';
import { LotDetailHeader } from '@/components/quality/lot-detail-header';
import { LotDetailTabs } from '@/components/quality/lot-detail-tabs';
import { Skeleton } from '@/components/ui/skeleton';

interface PageProps {
  params: Promise<{ projectId: string; lotId: string }>;
}

async function getLotDetail(projectId: string, lotId: string): Promise<LotWithRelationships | null> {
  try {
    const result = await neo4jClient.readOne<LotWithRelationships>(
      LOT_QUERIES.getLotDetail,
      { projectId, number: lotId }
    );
    
    if (!result) return null;
    
    return result;
  } catch (error) {
    console.error('Failed to fetch lot detail:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch lot detail');
  }
}

async function LotDetailContent({ projectId, lotId }: { projectId: string; lotId: string }) {
  const lot = await getLotDetail(projectId, lotId);
  
  if (!lot) {
    notFound();
  }
  
  return (
    <div className="space-y-6">
      <LotDetailHeader lot={lot} projectId={projectId} />
      <LotDetailTabs lot={lot} projectId={projectId} />
    </div>
  );
}

function LotDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export default async function LotDetailPage({ params }: PageProps) {
  const { projectId, lotId } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<LotDetailSkeleton />}>
        <LotDetailContent projectId={projectId} lotId={lotId} />
      </Suspense>
    </div>
  );
}

