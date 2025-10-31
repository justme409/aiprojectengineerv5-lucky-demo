import { Suspense } from 'react';
import { WorkTypeNode, WORK_TYPE_QUERIES } from '@/schemas/neo4j/work-type.schema';
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

/**
 * Work Types Reference Page
 * 
 * Displays all work type codes used in the project.
 * This is reference data extracted from specifications.
 */

interface PageProps {
  params: Promise<{ projectId: string }>;
}

async function getWorkTypes(projectId: string): Promise<WorkTypeNode[]> {
  try {
    return await neo4jClient.read<WorkTypeNode>(
      WORK_TYPE_QUERIES.getAllWorkTypes,
      { projectId }
    );
  } catch (error) {
    console.error('Failed to fetch work types:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch work types');
  }
}

async function WorkTypesContent({ projectId }: { projectId: string }) {
  const workTypes = await getWorkTypes(projectId);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Work Types</h1>
        <p className="text-muted-foreground mt-2">
          Reference data for work type codes
        </p>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  No work types found
                </TableCell>
              </TableRow>
            ) : (
              workTypes.map((workType) => (
                <TableRow key={workType.id}>
                  <TableCell className="font-medium">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {workType.code}
                    </Badge>
                  </TableCell>
                  <TableCell>{workType.description}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Total: {workTypes.length} work types
      </div>
    </div>
  );
}

function WorkTypesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="rounded-md border p-4 space-y-3">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

export default async function WorkTypesPage({ params }: PageProps) {
  const { projectId } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<WorkTypesSkeleton />}>
        <WorkTypesContent projectId={projectId} />
      </Suspense>
    </div>
  );
}

