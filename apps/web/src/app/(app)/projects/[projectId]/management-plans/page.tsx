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
            {plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No management plans found
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/projects/${projectId}/management-plans/${plan.id}`}
                      className="hover:underline text-blue-600 flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      {plan.type.replace('_', ' ').toUpperCase()}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{plan.version}</Badge>
                  </TableCell>
                  <TableCell>
                    <ApprovalStatusBadge status={plan.approvalStatus} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {plan.approvedDate 
                      ? format(new Date(plan.approvedDate), 'dd MMM yyyy')
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(plan.updatedAt), 'dd MMM yyyy')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Total: {plans.length} management plans
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

