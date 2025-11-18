import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { ManagementPlanDetailView } from '@/components/management-plans/plan-detail-view';
import { ManagementPlanSkeleton } from '@/components/management-plans/plan-skeleton';
import { loadPlanContext, type ManagementPlanType } from '@/lib/management-plans/plan-utils';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

const PLAN_TYPE: ManagementPlanType = 'OHSMP';

const COPY = {
  title: 'Occupational Health & Safety Management Plan',
  subtitle:
    'Safety leadership, hazard controls, and verification pathways that keep the workforce protected.',
  summaryTitle: 'Safety Strategy',
  notesTitle: 'Safety Notes & Critical Controls',
  sectionsTitle: 'Safety Assurance Sections',
  sectionsDescription:
    'These sections break down responsibilities, high-risk activities, and verification steps required for safe delivery.',
  additionalPropertiesTitle: 'Safety-Specific Properties',
  relationshipsTitle: 'Safety Relationships',
  relationshipsSubtitle:
    'Connected safety artefacts, workflows, and dependencies referenced by this plan.',
  showItpSection: false,
} as const;

async function OHSMPContent({ projectId }: { projectId: string }) {
  const context = await loadPlanContext(projectId, PLAN_TYPE);

  if (!context) {
    notFound();
  }

  return <ManagementPlanDetailView projectId={projectId} copy={COPY} {...context} />;
}

export default async function OHSMPPage({ params }: PageProps) {
  const { projectId } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<ManagementPlanSkeleton />}>
        <OHSMPContent projectId={projectId} />
      </Suspense>
    </div>
  );
}


