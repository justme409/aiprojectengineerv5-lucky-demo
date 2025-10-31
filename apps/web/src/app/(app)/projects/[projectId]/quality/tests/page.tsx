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
  params: { projectId: string };
  searchParams: { status?: string };
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
    
    const tests = await neo4jClient.read<TestRequestNode>(query, params);
    return tests;
  } catch (error) {
    console.error('Failed to fetch test requests:', error);
    return [];
  }
}

async function TestRequestsContent({ projectId, filters }: { projectId: string; filters: PageProps['searchParams'] }) {
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

export default function TestRequestsPage({ params, searchParams }: PageProps) {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<TestRequestsTableSkeleton />}>
        <TestRequestsContent projectId={params.projectId} filters={searchParams} />
      </Suspense>
    </div>
  );
}

