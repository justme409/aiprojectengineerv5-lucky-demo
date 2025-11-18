import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { ManagementPlanDetailView } from '@/components/management-plans/plan-detail-view';
import { ManagementPlanSkeleton } from '@/components/management-plans/plan-skeleton';
import { loadPlanContext, type ManagementPlanType } from '@/lib/management-plans/plan-utils';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

const PLAN_TYPE: ManagementPlanType = 'TMP';

const COPY = {
  title: 'Traffic Management Plan',
  subtitle:
    'Traffic staging, road authority requirements, and public interface controls for this project.',
  summaryTitle: 'Traffic Strategy',
  notesTitle: 'Traffic Notes & Assumptions',
  sectionsTitle: 'Traffic Control Sections',
  sectionsDescription:
    'These sections outline staging, detours, stakeholder notifications, and monitoring.',
  additionalPropertiesTitle: 'Traffic Properties',
  relationshipsTitle: 'Traffic Relationships',
  relationshipsSubtitle:
    'Traffic-related assets, approvals, and dependencies linked to this plan.',
  showItpSection: false,
} as const;

async function TMPContent({ projectId }: { projectId: string }) {
  const context = await loadPlanContext(projectId, PLAN_TYPE);

  if (!context) {
    notFound();
  }

  return <ManagementPlanDetailView projectId={projectId} copy={COPY} {...context} />;
}

export default async function TMPPage({ params }: PageProps) {
  const { projectId } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<ManagementPlanSkeleton />}>
        <TMPContent projectId={projectId} />
      </Suspense>
    </div>
  );
}


