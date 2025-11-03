import { Suspense } from 'react';
import { DocumentNode, DOCUMENT_QUERIES } from '@/schemas/neo4j';
import { neo4jClient } from '@/lib/neo4j';
import { DocumentsTable } from '@/components/documents/documents-table';
import { DocumentsTableSkeleton } from '@/components/documents/documents-table-skeleton';
import { CreateDocumentButton } from '@/components/documents/create-document-button';

/**
 * Document Register Page
 * 
 * Displays all documents for a project.
 * Documents include drawings, specifications, reports, and other project documentation.
 */

interface PageProps {
  params: Promise<{ projectId: string }>;
}

async function getDocuments(projectId: string): Promise<DocumentNode[]> {
  try {
    return await neo4jClient.read<DocumentNode>(
      DOCUMENT_QUERIES.getAllDocuments,
      { projectId }
    );
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch documents');
  }
}

async function DocumentsContent({ projectId }: { projectId: string }) {
  const documents = await getDocuments(projectId);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Register</h1>
          <p className="text-muted-foreground mt-2">
            Project documents, drawings, specifications, and reports
          </p>
        </div>
        <CreateDocumentButton projectId={projectId} />
      </div>
      
      <DocumentsTable documents={documents} projectId={projectId} />
      
      {documents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No documents found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Upload documents to track project documentation
          </p>
        </div>
      )}
    </div>
  );
}

export default async function DocumentsPage({ params }: PageProps) {
  const { projectId } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<DocumentsTableSkeleton />}>
        <DocumentsContent projectId={projectId} />
      </Suspense>
    </div>
  );
}
