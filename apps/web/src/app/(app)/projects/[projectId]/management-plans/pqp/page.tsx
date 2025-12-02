import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { PlanDocumentView } from '@/components/management-plans/plan-document-view';
import { ManagementPlanSkeleton } from '@/components/management-plans/plan-skeleton';
import { loadPlanContext, type ManagementPlanType } from '@/lib/management-plans/plan-utils';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

const PLAN_TYPE: ManagementPlanType = 'PQP';

async function PQPContent({ projectId }: { projectId: string }) {
  const context = await loadPlanContext(projectId, PLAN_TYPE);

  if (!context) {
    notFound();
  }

  return (
    <PlanDocumentView
      projectId={projectId}
      plan={context.plan}
      sections={context.sections}
      planTypeSlug="pqp"
    />
  );
}

export default async function PQPPage({ params }: PageProps) {
  const { projectId } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<ManagementPlanSkeleton />}>
        <PQPContent projectId={projectId} />
      </Suspense>
    </div>
  );
}
