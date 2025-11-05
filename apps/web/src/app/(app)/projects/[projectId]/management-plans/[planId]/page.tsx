import { Suspense, type ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';

import { neo4jClient } from '@/lib/neo4j';
import {
  ManagementPlanNode,
  MANAGEMENT_PLAN_QUERIES,
} from '@/schemas/neo4j';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface PageProps {
  params: Promise<{ projectId: string; planId: string }>;
}

async function fetchManagementPlan(
  projectId: string,
  planId: string,
): Promise<ManagementPlanNode | null> {
  const byId = await neo4jClient.readOne<ManagementPlanNode>(
    MANAGEMENT_PLAN_QUERIES.getPlanById,
    { projectId, planId },
  );

  if (byId) {
    return byId;
  }

  const byType = await neo4jClient.read<ManagementPlanNode>(
    MANAGEMENT_PLAN_QUERIES.getPlanByType,
    { projectId, type: planId.toUpperCase() },
  );

  return byType?.[0] ?? null;
}

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'bigint') return Number(value);
  if (
    typeof value === 'object' &&
    value !== null &&
    'toNumber' in (value as Record<string, unknown>) &&
    typeof (value as { toNumber?: () => number }).toNumber === 'function'
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value ?? 0);
};

const toDate = (value?: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (
    typeof value === 'object' &&
    value !== null &&
    'year' in (value as Record<string, unknown>) &&
    'month' in (value as Record<string, unknown>) &&
    'day' in (value as Record<string, unknown>)
  ) {
    const temporal = value as { year: unknown; month: unknown; day: unknown; hour?: unknown; minute?: unknown; second?: unknown; nanosecond?: unknown };
    return new Date(Date.UTC(
      toNumber(temporal.year),
      toNumber(temporal.month) - 1,
      toNumber(temporal.day),
      toNumber(temporal.hour ?? 0),
      toNumber(temporal.minute ?? 0),
      toNumber(temporal.second ?? 0),
      temporal.nanosecond ? Math.floor(toNumber(temporal.nanosecond) / 1e6) : 0,
    ));
  }

  const date = new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? null : date;
};

function formatDateValue(value?: unknown) {
  try {
    const date = toDate(value);
    return date ? format(date, 'dd MMM yyyy') : '-';
  } catch (error) {
    console.warn('Unable to format date value', value, error);
    return '-';
  }
}

function ApprovalStatusBadge({ status }: { status: ManagementPlanNode['approvalStatus'] }) {
  const config: Record<ManagementPlanNode['approvalStatus'], { label: string; variant: 'secondary' | 'default' | 'success' | 'destructive' }> = {
    draft: { label: 'Draft', variant: 'secondary' },
    in_review: { label: 'In Review', variant: 'default' },
    approved: { label: 'Approved', variant: 'success' },
    superseded: { label: 'Superseded', variant: 'destructive' },
  };

  const item = config[status];

  return <Badge variant={item.variant}>{item.label}</Badge>;
}

async function ManagementPlanContent({
  projectId,
  planId,
}: {
  projectId: string;
  planId: string;
}) {
  const plan = await fetchManagementPlan(projectId, planId);

  if (!plan) {
    notFound();
  }

  const typeLabels: Partial<Record<ManagementPlanNode['type'], string>> = {
    PQP: 'Project Quality Plan',
    OHSMP: 'Occupational Health & Safety Management Plan',
    EMP: 'Environmental Management Plan',
    CEMP: 'Construction Environmental Management Plan',
    TMP: 'Traffic Management Plan',
  };

  const metadata: Array<{ label: string; value: ReactNode }> = [
    { label: 'Plan Type', value: typeLabels[plan.type] ?? plan.type },
    { label: 'Version', value: plan.version || '—' },
    { label: 'Status', value: <ApprovalStatusBadge status={plan.approvalStatus} /> },
    { label: 'Approved By', value: plan.approvedBy || '—' },
    { label: 'Approved Date', value: formatDateValue(plan.approvedDate) },
    { label: 'Created', value: formatDateValue(plan.createdAt) },
    { label: 'Last Updated', value: formatDateValue(plan.updatedAt) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {plan.title || `${plan.type} Management Plan`}
        </h1>
        <p className="text-muted-foreground mt-2">
          {plan.summary || 'Generated management plan'}
        </p>
      </div>

      <Card>
        <CardContent className="py-4">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metadata.map((item) => (
              <div key={item.label} className="flex flex-col gap-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </dt>
                <dd className="text-sm text-foreground">{item.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      {plan.notes ? (
        <Card>
          <CardContent className="py-4">
            <h2 className="text-lg font-semibold">Notes</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{plan.notes}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="prose prose-slate max-w-none py-6" dangerouslySetInnerHTML={{ __html: plan.htmlContent || '<p>No plan content available.</p>' }} />
      </Card>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <Link
          href={`/projects/${projectId}/management-plans`}
          className="hover:underline text-blue-600"
        >
          ← Back to Management Plans
        </Link>
      </div>
    </div>
  );
}

function ManagementPlanSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-[600px] w-full" />
    </div>
  );
}

export default async function ManagementPlanPage({ params }: PageProps) {
  const { projectId, planId } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<ManagementPlanSkeleton />}>
        <ManagementPlanContent projectId={projectId} planId={planId} />
      </Suspense>
    </div>
  );
}


