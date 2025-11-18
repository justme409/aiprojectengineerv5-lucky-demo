import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { ManagementPlanDetailView } from '@/components/management-plans/plan-detail-view';
import { ManagementPlanSkeleton } from '@/components/management-plans/plan-skeleton';
import { loadPlanContext, type ManagementPlanType } from '@/lib/management-plans/plan-utils';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

const PLAN_TYPE: ManagementPlanType = 'EMP';

const COPY = {
  title: 'Environmental Management Plan',
  subtitle:
    'Environmental obligations, mitigation measures, and monitoring commitments for this project.',
  summaryTitle: 'Environmental Overview',
  notesTitle: 'Environmental Notes & Commitments',
  sectionsTitle: 'Environmental Controls',
  sectionsDescription:
    'Sections highlight environmental risks, mitigation actions, and compliance checkpoints.',
  additionalPropertiesTitle: 'Environmental Properties',
  relationshipsTitle: 'Environmental Relationships',
  relationshipsSubtitle:
    'Assets and workflows that underpin environmental compliance for this plan.',
  showItpSection: false,
} as const;

async function EMPContent({ projectId }: { projectId: string }) {
  const context = await loadPlanContext(projectId, PLAN_TYPE);

  if (!context) {
    notFound();
  }

  return <ManagementPlanDetailView projectId={projectId} copy={COPY} {...context} />;
}

export default async function EMPPage({ params }: PageProps) {
  const { projectId } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<ManagementPlanSkeleton />}>
        <EMPContent projectId={projectId} />
      </Suspense>
    </div>
  );
}


