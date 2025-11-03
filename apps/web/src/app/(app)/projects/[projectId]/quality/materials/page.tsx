import { Suspense } from 'react';
import { MaterialNode, MATERIAL_QUERIES } from '@/schemas/neo4j';
import { neo4jClient } from '@/lib/neo4j';
import { MaterialsTable } from '@/components/quality/materials-table';
import { MaterialsTableSkeleton } from '@/components/quality/materials-table-skeleton';
import { CreateMaterialButton } from '@/components/quality/create-material-button';

/**
 * Materials Register Page
 * 
 * Displays all materials for a project.
 * Materials track approved products, suppliers, and certificates.
 */

interface PageProps {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<{ status?: string }>;
}

async function getMaterials(
  projectId: string,
  filters: { status?: string }
): Promise<MaterialNode[]> {
  try {
    let query = MATERIAL_QUERIES.getAllMaterials;
    const params: Record<string, any> = { projectId };
    
    if (filters.status === 'approved') {
      query = MATERIAL_QUERIES.getApprovedMaterials;
    }
    
    return await neo4jClient.read<MaterialNode>(query, params);
  } catch (error) {
    console.error('Failed to fetch materials:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch materials');
  }
}

async function MaterialsContent({ projectId, filters }: { projectId: string; filters: { status?: string } }) {
  const materials = await getMaterials(projectId, filters);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Materials Register</h1>
          <p className="text-muted-foreground mt-2">
            Track approved materials, suppliers, and product certificates
          </p>
        </div>
        <CreateMaterialButton projectId={projectId} />
      </div>
      
      <MaterialsTable materials={materials} projectId={projectId} />
      
      {materials.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No materials found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add materials to track approved products and suppliers
          </p>
        </div>
      )}
    </div>
  );
}

export default async function MaterialsPage({ params, searchParams }: PageProps) {
  const [{ projectId }, filters] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({}),
  ]);

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<MaterialsTableSkeleton />}>
        <MaterialsContent projectId={projectId} filters={filters ?? {}} />
      </Suspense>
    </div>
  );
}

