import { notFound, redirect } from 'next/navigation';

import {
  fetchPlanById,
  isManagementPlanType,
  managementPlanSlugToType,
  managementPlanTypeToSlug,
} from '@/lib/management-plans/plan-utils';

interface PageProps {
  params: Promise<{ projectId: string; planId: string }>;
}

export default async function ManagementPlanRedirectPage({ params }: PageProps) {
  const { projectId, planId } = await params;

  if (!planId) {
    notFound();
  }

  const normalizedSlug = planId.trim().toLowerCase();
  const typeFromSlug = managementPlanSlugToType(normalizedSlug);

  if (typeFromSlug) {
    redirect(`/projects/${projectId}/management-plans/${managementPlanTypeToSlug(typeFromSlug)}`);
  }

  const normalizedType = planId.trim().toUpperCase();
  if (isManagementPlanType(normalizedType)) {
    redirect(`/projects/${projectId}/management-plans/${managementPlanTypeToSlug(normalizedType)}`);
  }

  const plan = await fetchPlanById(projectId, planId).catch((error) => {
    console.error('Error resolving management plan for redirect', { projectId, planId, error });
    return null;
  });

  if (plan?.type && isManagementPlanType(plan.type)) {
    redirect(`/projects/${projectId}/management-plans/${managementPlanTypeToSlug(plan.type)}`);
  }

  notFound();
}



