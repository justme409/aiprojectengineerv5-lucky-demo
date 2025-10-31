import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { LotWithRelationships, LOT_QUERIES } from '@/schemas/neo4j/lot.schema';
import { neo4jClient } from '@/lib/neo4j';
import { LotDetailHeader } from '@/components/quality/lot-detail-header';
import { LotDetailTabs } from '@/components/quality/lot-detail-tabs';
import { Skeleton } from '@/components/ui/skeleton';

interface PageProps {
  params: { projectId: string; lotId: string };
}

async function getLotDetail(lotId: string): Promise<LotWithRelationships | null> {
  try {
    const result = await neo4jClient.readOne<any>(
      LOT_QUERIES.getLotDetail,
      { lotId }
    );
    
    if (!result) return null;
    
    // Transform Neo4j result to LotWithRelationships
    return {
      ...result.l,
      relationships: {
        belongsToProject: result.l.projectId || '',
        implements: result.itpInstances?.map((itp: any) => itp.id) || [],
        hasNCR: result.ncrs?.map((ncr: any) => ncr.id) || [],
        hasTest: result.tests?.map((test: any) => test.id) || [],
        usesMaterial: result.materials?.map((mat: any) => mat.id) || [],
        hasQuantity: result.quantities?.map((qty: any) => qty.id) || [],
        relatedDocuments: result.documents?.map((doc: any) => doc.id) || [],
        relatedPhotos: result.photos?.map((photo: any) => photo.id) || [],
      },
      itpInstances: result.itpInstances || [],
      ncrs: result.ncrs || [],
      tests: result.tests || [],
      materials: result.materials || [],
      quantities: result.quantities || [],
    };
  } catch (error) {
    console.error('Failed to fetch lot detail:', error);
    return null;
  }
}

async function LotDetailContent({ projectId, lotId }: { projectId: string; lotId: string }) {
  const lot = await getLotDetail(lotId);
  
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

export default function LotDetailPage({ params }: PageProps) {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<LotDetailSkeleton />}>
        <LotDetailContent projectId={params.projectId} lotId={params.lotId} />
      </Suspense>
    </div>
  );
}

