import { Suspense } from 'react';
import { TestRequestNode, TEST_REQUEST_QUERIES } from '@/schemas/neo4j/test-request.schema';
import { neo4jClient } from '@/lib/neo4j';
import { TestRequestsTable } from '@/components/quality/test-requests-table';
import { TestRequestsTableSkeleton } from '@/components/quality/test-requests-table-skeleton';
import { CreateTestRequestButton } from '@/components/quality/create-test-request-button';

/**
 * Test Requests Register Page
 * 
 * Displays all test requests for a project.
 * Test requests track laboratory testing of materials and samples.
 */

interface PageProps {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<{ status?: string }>;
}

async function getTestRequests(
  projectId: string,
  filters: { status?: string }
): Promise<TestRequestNode[]> {
  try {
    let query = TEST_REQUEST_QUERIES.getAllTests;
    const params: Record<string, any> = { projectId };
    
    if (filters.status === 'pending') {
      query = TEST_REQUEST_QUERIES.getPendingTests;
    }
    
    return await neo4jClient.read<TestRequestNode>(query, params);
  } catch (error) {
    console.error('Failed to fetch test requests:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch test requests');
  }
}

async function TestRequestsContent({ projectId, filters }: { projectId: string; filters: { status?: string } }) {
  const tests = await getTestRequests(projectId, filters);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Requests Register</h1>
          <p className="text-muted-foreground mt-2">
            Track laboratory testing of materials and samples
          </p>
        </div>
        <CreateTestRequestButton projectId={projectId} />
      </div>
      
      <TestRequestsTable tests={tests} projectId={projectId} />
      
      {tests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No test requests found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a test request to track laboratory testing
          </p>
        </div>
      )}
    </div>
  );
}

export default async function TestRequestsPage({ params, searchParams }: PageProps) {
  const [{ projectId }, filters] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({}),
  ]);

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<TestRequestsTableSkeleton />}>
        <TestRequestsContent projectId={projectId} filters={filters ?? {}} />
      </Suspense>
    </div>
  );
}

