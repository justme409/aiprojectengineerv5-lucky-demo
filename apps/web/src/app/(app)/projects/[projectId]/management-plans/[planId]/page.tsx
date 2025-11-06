import { Suspense, type ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { HelpCircle } from 'lucide-react';

import { neo4jClient } from '@/lib/neo4j';
import {
  ManagementPlanNode,
  MANAGEMENT_PLAN_QUERIES,
  ITPTemplateNode,
  ITP_TEMPLATE_QUERIES,
} from '@/schemas/neo4j';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PageProps {
  params: Promise<{ projectId: string; planId: string }>;
}

const PLAN_RELATIONSHIPS_QUERY = `
  MATCH (m:ManagementPlan {projectId: $projectId})
  WHERE (
      $planElementId IS NOT NULL AND elementId(m) = $planElementId
    ) OR (
      $planElementId IS NULL AND m.type = $planType AND m.version = $planVersion
    )
  WITH m
  LIMIT 1
  OPTIONAL MATCH (m)-[r]->(target)
  RETURN type(r) AS relationshipType, labels(target) AS targetLabels, target
`;

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

function humanizeKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_\s]+/g, ' ')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(
      value,
      (_key, inner) => {
        if (inner instanceof Date) {
          return inner.toISOString();
        }
        if (typeof inner === 'bigint') {
          return Number(inner);
        }
        if (
          inner &&
          typeof inner === 'object' &&
          'toNumber' in (inner as Record<string, unknown>) &&
          typeof (inner as { toNumber?: () => number }).toNumber === 'function'
        ) {
          return (inner as { toNumber: () => number }).toNumber();
        }
        if (
          inner &&
          typeof inner === 'object' &&
          'year' in (inner as Record<string, unknown>) &&
          'month' in (inner as Record<string, unknown>) &&
          'day' in (inner as Record<string, unknown>)
        ) {
          return formatDateValue(inner);
        }
        return inner;
      },
      2,
    );
  } catch (error) {
    console.warn('Unable to stringify value', value, error);
    return JSON.stringify({ error: 'Unable to render value' }, null, 2);
  }
}

function formatPropertyValue(value: unknown): ReactNode {
  if (value === null || value === undefined) {
    return '—';
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '—';
    }

    return (
      <ul className="list-disc space-y-1 pl-5">
        {value.map((item, index) => (
          <li key={index} className="text-sm text-foreground">
            {formatPropertyValue(item)}
          </li>
        ))}
      </ul>
    );
  }

  if (value instanceof Date) {
    return formatDateValue(value);
  }

  if (typeof value === 'object') {
    if (
      value &&
      'year' in (value as Record<string, unknown>) &&
      'month' in (value as Record<string, unknown>) &&
      'day' in (value as Record<string, unknown>)
    ) {
      return formatDateValue(value);
    }

    if (
      'toNumber' in (value as Record<string, unknown>) &&
      typeof (value as { toNumber?: () => number }).toNumber === 'function'
    ) {
      return (value as { toNumber: () => number }).toNumber();
    }

    return (
      <pre className="overflow-x-auto rounded border border-border/40 bg-muted/60 p-3 text-xs leading-relaxed text-foreground">
        {safeStringify(value)}
      </pre>
    );
  }

  if (typeof value === 'bigint') {
    return Number(value).toString();
  }

  return String(value);
}

function ApprovalStatusBadge({
  status,
}: {
  status?: ManagementPlanNode['approvalStatus'] | null;
}) {
  const config: Record<ManagementPlanNode['approvalStatus'], { label: string; variant: 'secondary' | 'default' | 'success' | 'destructive' }> = {
    draft: { label: 'Draft', variant: 'secondary' },
    in_review: { label: 'In Review', variant: 'default' },
    approved: { label: 'Approved', variant: 'success' },
    superseded: { label: 'Superseded', variant: 'destructive' },
  };

  if (!status) {
    return (
      <Badge variant="outline" className="gap-1 border-amber-300 text-amber-700">
        <HelpCircle className="h-3 w-3" />
        Status not set
      </Badge>
    );
  }

  const item = config[status];

  if (!item) {
    console.warn('Unknown management plan approval status encountered', status);
    return (
      <Badge variant="outline" className="gap-1 border-amber-300 text-amber-700">
        <HelpCircle className="h-3 w-3" />
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  }

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

  type PlanRelationshipRecord = {
    relationshipType: string | null;
    targetLabels: string[] | null;
    target: Record<string, unknown> | null;
  };

  let itpTemplates: ITPTemplateNode[] = [];
  let relatedNodes: PlanRelationshipRecord[] = [];

  try {
    itpTemplates = await neo4jClient.read<ITPTemplateNode>(
      ITP_TEMPLATE_QUERIES.getAllTemplates,
      { projectId },
    );
  } catch (error) {
    console.error('Error loading ITP templates for management plan view', error);
  }

  try {
    relatedNodes = await neo4jClient.read<PlanRelationshipRecord>(
      PLAN_RELATIONSHIPS_QUERY,
      {
        projectId,
        planElementId: plan.id ?? null,
        planType: plan.type,
        planVersion: plan.version,
      },
    );
  } catch (error) {
    console.error('Error loading related nodes for management plan', error);
  }

  const filteredRelationships = relatedNodes.filter(
    (item) => item.relationshipType && item.target,
  ) as Array<Required<PlanRelationshipRecord>>;

  const typeLabels: Partial<Record<ManagementPlanNode['type'], string>> = {
    PQP: 'Project Quality Plan',
    OHSMP: 'Occupational Health & Safety Management Plan',
    EMP: 'Environmental Management Plan',
    CEMP: 'Construction Environmental Management Plan',
    TMP: 'Traffic Management Plan',
  };

  const metadata: Array<{ label: string; value: ReactNode }> = [
    { label: 'Neo4j Element ID', value: plan.id || '—' },
    { label: 'Project ID', value: plan.projectId },
    { label: 'Plan Type', value: typeLabels[plan.type] ?? plan.type },
    { label: 'Version', value: plan.version || '—' },
    { label: 'Status', value: <ApprovalStatusBadge status={plan.approvalStatus} /> },
    { label: 'Approved By', value: plan.approvedBy || '—' },
    { label: 'Approved Date', value: formatDateValue(plan.approvedDate) },
    { label: 'Created', value: formatDateValue(plan.createdAt) },
    { label: 'Last Updated', value: formatDateValue(plan.updatedAt) },
  ];

  const displayedKeys = new Set([
    'id',
    'projectId',
    'type',
    'title',
    'version',
    'approvalStatus',
    'approvedBy',
    'approvedDate',
    'createdAt',
    'updatedAt',
    'summary',
    'htmlContent',
    'notes',
  ]);

  const extraProperties = Object.entries(plan as Record<string, unknown>)
    .filter(([key, value]) => {
      if (displayedKeys.has(key)) {
        return false;
      }
      if (value === null || value === undefined) {
        return false;
      }
      if (typeof value === 'string' && value.trim() === '') {
        return false;
      }
      if (Array.isArray(value) && value.length === 0) {
        return false;
      }
      return true;
    })
    .map(([key, value]) => ({ key, value }));

  const sortedItps = [...itpTemplates].sort((a, b) => a.docNo.localeCompare(b.docNo));

  const formatBadgeTone = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === 'approved') {
      return 'border-emerald-200 bg-emerald-100 text-emerald-800';
    }
    if (normalized === 'draft' || normalized === 'not_required') {
      return 'border-slate-200 bg-slate-100 text-slate-800';
    }
    if (normalized === 'pending' || normalized === 'in_review') {
      return 'border-amber-200 bg-amber-100 text-amber-800';
    }
    if (normalized === 'rejected' || normalized === 'superseded') {
      return 'border-rose-200 bg-rose-100 text-rose-800';
    }
    return 'border-secondary/40 bg-secondary/40 text-secondary-foreground';
  };

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

      {extraProperties.length ? (
        <Card>
          <CardContent className="py-4">
            <h2 className="text-lg font-semibold">Additional Properties</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {extraProperties.map(({ key, value }) => (
                <div key={key} className="flex flex-col gap-1">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {humanizeKey(key)}
                  </dt>
                  <dd className="text-sm text-foreground">{formatPropertyValue(value)}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="prose prose-slate max-w-none py-6" dangerouslySetInnerHTML={{ __html: plan.htmlContent || '<p>No plan content available.</p>' }} />
      </Card>

      <Card>
        <CardContent className="py-4 space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 className="text-lg font-semibold">Inspection &amp; Test Plans</h2>
            <span className="text-sm text-muted-foreground">
              Pulled from Neo4j ITPTemplate nodes ({sortedItps.length})
            </span>
          </div>

          {sortedItps.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No ITP templates found for this project yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Work Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead>Revision</TableHead>
                    <TableHead>Revision Date</TableHead>
                    <TableHead>Approved By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedItps.map((template, index) => {
                    const templateKey = template.id
                      ? String(template.id)
                      : `${template.docNo}-${template.revisionNumber}-${index}`;

                    return (
                      <TableRow key={templateKey}>
                      <TableCell className="font-medium text-sm">
                        {template.docNo}
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {template.description || '—'}
                      </TableCell>
                      <TableCell className="text-sm capitalize text-foreground">
                        {template.workType?.replace(/_/g, ' ') || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={formatBadgeTone(template.status)}
                        >
                          {template.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={formatBadgeTone(template.approvalStatus)}
                        >
                          {template.approvalStatus.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        v{template.revisionNumber || '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateValue(template.revisionDate)}
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {template.approvedBy || '—'}
                      </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4 space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 className="text-lg font-semibold">Related Neo4j Nodes</h2>
            <span className="text-sm text-muted-foreground">
              Direct outgoing relationships from this management plan
            </span>
          </div>

          {filteredRelationships.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No related nodes found for this management plan at the moment.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredRelationships.map((relation, index) => (
                <div
                  key={`${relation.relationshipType}-${relation.target?.id ?? index}`}
                  className="rounded border border-border/40 bg-muted/40 p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {relation.targetLabels?.[0] ?? 'Node'}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Labels: {relation.targetLabels?.join(', ') || '—'}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs uppercase tracking-wide">
                      {relation.relationshipType?.replace(/_/g, ' ') ?? 'Related'}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <pre className="overflow-x-auto rounded border border-border/30 bg-background p-3 text-xs leading-relaxed text-foreground">
                      {safeStringify(relation.target)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4 space-y-3">
          <h2 className="text-lg font-semibold">Raw Neo4j Payload</h2>
          <pre className="overflow-x-auto rounded border border-border/40 bg-background p-3 text-xs leading-relaxed text-foreground">
            {safeStringify(plan)}
          </pre>
        </CardContent>
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


