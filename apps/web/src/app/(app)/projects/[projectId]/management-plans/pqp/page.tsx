import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { ManagementPlanDetailView } from '@/components/management-plans/plan-detail-view';
import { ManagementPlanSkeleton } from '@/components/management-plans/plan-skeleton';
import { loadPlanContext, type ManagementPlanType } from '@/lib/management-plans/plan-utils';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

const PLAN_TYPE: ManagementPlanType = 'PQP';

const COPY = {
  title: 'Project Quality Plan',
  subtitle:
    'Quality governance, inspection checkpoints, and evidence requirements captured for this project.',
  summaryTitle: 'Quality Overview',
  notesTitle: 'Quality Notes',
  sectionsTitle: 'Quality Workflow Sections',
  sectionsDescription:
    'Each section outlines the quality controls, responsibilities, and inspection points structured for delivery.',
  itpTitle: 'Linked Inspection & Test Plans',
  itpSubtitle: 'Quality-aligned ITP templates referenced by this project plan.',
  additionalPropertiesTitle: 'Quality-Specific Properties',
  relationshipsTitle: 'Quality Relationships',
  relationshipsSubtitle:
    'Downstream quality assets and dependencies linked from this Project Quality Plan.',
} as const;

async function PQPContent({ projectId }: { projectId: string }) {
  const context = await loadPlanContext(projectId, PLAN_TYPE);

  if (!context) {
    notFound();
  }

  return <ManagementPlanDetailView projectId={projectId} copy={COPY} {...context} />;
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



