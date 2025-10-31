import { Suspense } from 'react';
import { TestMethodNode, TEST_METHOD_QUERIES } from '@/schemas/neo4j/test-method.schema';
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
 * Test Methods Reference Page
 * 
 * Displays all test methods and standards for the project.
 * This is reference data extracted from specifications.
 */

interface PageProps {
  params: Promise<{ projectId: string }>;
}

async function getTestMethods(projectId: string): Promise<TestMethodNode[]> {
  try {
    return await neo4jClient.read<TestMethodNode>(
      TEST_METHOD_QUERIES.getAllMethods,
      { projectId }
    );
  } catch (error) {
    console.error('Failed to fetch test methods:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch test methods');
  }
}

async function TestMethodsContent({ projectId }: { projectId: string }) {
  const methods = await getTestMethods(projectId);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Test Methods</h1>
        <p className="text-muted-foreground mt-2">
          Reference data for test methods and standards
        </p>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Standard</TableHead>
              <TableHead>Acceptance Criteria</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {methods.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No test methods found
                </TableCell>
              </TableRow>
            ) : (
              methods.map((method) => (
                <TableRow key={method.id}>
                  <TableCell className="font-medium">
                    <Badge variant="outline">{method.code}</Badge>
                  </TableCell>
                  <TableCell>{method.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {method.standard}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {method.acceptanceCriteria || '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Total: {methods.length} test methods
      </div>
    </div>
  );
}

function TestMethodsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="rounded-md border p-4 space-y-3">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

export default async function TestMethodsPage({ params }: PageProps) {
  const { projectId } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<TestMethodsSkeleton />}>
        <TestMethodsContent projectId={projectId} />
      </Suspense>
    </div>
  );
}

