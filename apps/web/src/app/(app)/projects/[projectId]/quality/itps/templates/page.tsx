import { Suspense } from 'react';
import { ITPTemplateNode, ITP_TEMPLATE_QUERIES } from '@/schemas/neo4j/itp-template.schema';
import { neo4jClient } from '@/lib/neo4j';
import { ITPTemplatesTable } from '@/components/quality/itp-templates-table';
import { ITPTemplatesTableSkeleton } from '@/components/quality/itp-templates-table-skeleton';
import { CreateITPTemplateButton } from '@/components/quality/create-itp-template-button';

/**
 * ITP Templates Register Page
 * 
 * Displays all ITP templates for a project.
 * Templates are extracted by agents from specification documents.
 */

interface PageProps {
  params: { projectId: string };
  searchParams: { status?: string; workType?: string };
}

async function getITPTemplates(
  projectId: string,
  filters: { status?: string; workType?: string }
): Promise<ITPTemplateNode[]> {
  try {
    let query = ITP_TEMPLATE_QUERIES.getAllTemplates;
    let params: Record<string, any> = { projectId };
    
    if (filters.status === 'approved') {
      query = ITP_TEMPLATE_QUERIES.getApprovedTemplates;
    } else if (filters.status === 'pending') {
      query = ITP_TEMPLATE_QUERIES.getTemplatesPendingApproval;
    } else if (filters.workType) {
      query = ITP_TEMPLATE_QUERIES.getTemplatesByWorkType;
      params.workType = filters.workType;
    }
    
    const templates = await neo4jClient.read<ITPTemplateNode>(query, params);
    return templates;
  } catch (error) {
    console.error('Failed to fetch ITP templates:', error);
    return [];
  }
}

async function ITPTemplatesContent({ projectId, filters }: { projectId: string; filters: PageProps['searchParams'] }) {
  const templates = await getITPTemplates(projectId, filters);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ITP Templates Register</h1>
          <p className="text-muted-foreground mt-2">
            Inspection and Test Plan templates extracted from specifications
          </p>
        </div>
        <CreateITPTemplateButton projectId={projectId} />
      </div>
      
      <ITPTemplatesTable templates={templates} projectId={projectId} />
      
      {templates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No ITP templates found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Upload specification documents for the agent to extract ITP templates
          </p>
        </div>
      )}
    </div>
  );
}

export default function ITPTemplatesPage({ params, searchParams }: PageProps) {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<ITPTemplatesTableSkeleton />}>
        <ITPTemplatesContent projectId={params.projectId} filters={searchParams} />
      </Suspense>
    </div>
  );
}

