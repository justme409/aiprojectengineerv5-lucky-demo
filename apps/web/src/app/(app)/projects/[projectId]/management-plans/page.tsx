import { Suspense } from 'react';
import { ManagementPlanNode, MANAGEMENT_PLAN_QUERIES } from '@/schemas/neo4j';
import { neo4jClient } from '@/lib/neo4j';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

/**
 * Management Plans Page
 * 
 * Displays all management plans for the project.
 * Includes quality, environmental, safety, and other management plans.
 */

interface PageProps {
  params: Promise<{ projectId: string }>;
}

async function getManagementPlans(projectId: string): Promise<ManagementPlanNode[]> {
  try {
    return await neo4jClient.read<ManagementPlanNode>(
      MANAGEMENT_PLAN_QUERIES.getAllPlans,
      { projectId }
    );
  } catch (error) {
    console.error('Failed to fetch management plans:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch management plans');
  }
}

async function ManagementPlansContent({ projectId }: { projectId: string }) {
  const plans = await getManagementPlans(projectId);
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
      const temporal = value as { year: number; month: number; day: number; hour?: number; minute?: number; second?: number; nanosecond?: number };
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

  const formatDate = (value?: unknown) => {
    try {
      const date = toDate(value);
      return date ? format(date, 'dd MMM yyyy') : '-';
    } catch (error) {
      console.warn('Unable to format date value', value, error);
      return '-';
    }
  };

  const statusPriority: Record<ManagementPlanNode['approvalStatus'], number> = {
    draft: 4,
    in_review: 3,
    approved: 2,
    superseded: 1,
  };

  const toEpoch = (value?: unknown) => {
    const date = toDate(value);
    return date ? date.getTime() : 0;
  };

  const dedupedPlans = Object.values(
    plans.reduce<Record<string, ManagementPlanNode>>((acc, plan) => {
      const key = plan.type;
      const existing = acc[key];
      if (!existing) {
        acc[key] = plan;
        return acc;
      }

      const existingPriority = statusPriority[existing.approvalStatus];
      const currentPriority = statusPriority[plan.approvalStatus];

      if (currentPriority > existingPriority) {
        acc[key] = plan;
        return acc;
      }

      if (currentPriority === existingPriority && toEpoch(plan.updatedAt) > toEpoch(existing.updatedAt)) {
        acc[key] = plan;
      }

      return acc;
    }, {})
  ).sort((a, b) => a.type.localeCompare(b.type));
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Management Plans</h1>
        <p className="text-muted-foreground mt-2">
          Project management plans including quality, environmental, and safety plans
        </p>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan Type</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Approval Status</TableHead>
              <TableHead>Approved Date</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dedupedPlans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No management plans found
                </TableCell>
              </TableRow>
            ) : (
              dedupedPlans.map((plan) => (
                <TableRow key={plan.id ?? `${plan.type}-${plan.version}`}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/projects/${projectId}/management-plans/${plan.id ?? plan.type}`}
                      className="hover:underline text-blue-600 flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      {plan.title || plan.type.replace('_', ' ').toUpperCase()}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{plan.version || '—'}</Badge>
                  </TableCell>
                  <TableCell>
                    <ApprovalStatusBadge status={plan.approvalStatus} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(plan.approvedDate)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(plan.updatedAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Total: {dedupedPlans.length} management plans
      </div>
    </div>
  );
}

function ApprovalStatusBadge({ status }: { status: ManagementPlanNode['approvalStatus'] }) {
  const config: Record<ManagementPlanNode['approvalStatus'], { icon: any; variant: any; label: string }> = {
    draft: { icon: Clock, variant: 'secondary', label: 'Draft' },
    in_review: { icon: Clock, variant: 'default', label: 'In Review' },
    approved: { icon: CheckCircle, variant: 'success', label: 'Approved' },
    superseded: { icon: AlertCircle, variant: 'destructive', label: 'Superseded' },
  };
  
  const item = config[status];
  const Icon = item.icon;
  
  return (
    <Badge variant={item.variant as any} className="gap-1">
      <Icon className="h-3 w-3" />
      {item.label}
    </Badge>
  );
}

function ManagementPlansSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="rounded-md border p-4 space-y-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

export default async function ManagementPlansPage({ params }: PageProps) {
  const { projectId } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<ManagementPlansSkeleton />}>
        <ManagementPlansContent projectId={projectId} />
      </Suspense>
    </div>
  );
}

