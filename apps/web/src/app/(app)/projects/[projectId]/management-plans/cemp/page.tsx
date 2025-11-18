import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { ManagementPlanDetailView } from '@/components/management-plans/plan-detail-view';
import { ManagementPlanSkeleton } from '@/components/management-plans/plan-skeleton';
import { loadPlanContext, type ManagementPlanType } from '@/lib/management-plans/plan-utils';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

const PLAN_TYPE: ManagementPlanType = 'CEMP';

const COPY = {
  title: 'Construction Environmental Management Plan',
  subtitle:
    'Construction-phase environmental controls, approvals, and monitoring routines.',
  summaryTitle: 'Construction Environment Overview',
  notesTitle: 'CEMP Notes & Conditions',
  sectionsTitle: 'Construction Environmental Sections',
  sectionsDescription:
    'Detailed construction sequencing, sensitive area protections, and inspection steps.',
  additionalPropertiesTitle: 'CEMP Properties',
  relationshipsTitle: 'CEMP Relationships',
  relationshipsSubtitle:
    'Linked construction environmental actions and controls.',
  showItpSection: false,
} as const;

async function CEMPContent({ projectId }: { projectId: string }) {
  const context = await loadPlanContext(projectId, PLAN_TYPE);

  if (!context) {
    notFound();
  }

  return <ManagementPlanDetailView projectId={projectId} copy={COPY} {...context} />;
}

export default async function CEMPPage({ params }: PageProps) {
  const { projectId } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<ManagementPlanSkeleton />}>
        <CEMPContent projectId={projectId} />
      </Suspense>
    </div>
  );
}


