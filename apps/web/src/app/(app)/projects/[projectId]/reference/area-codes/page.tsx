import { Suspense } from 'react';
import { AreaCodeNode, AREA_CODE_QUERIES } from '@/schemas/neo4j/area-code.schema';
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
 * Area Codes Reference Page
 * 
 * Displays all area codes used in the project.
 * This is reference data extracted from drawings and project layout.
 */

interface PageProps {
  params: Promise<{ projectId: string }>;
}

async function getAreaCodes(projectId: string): Promise<AreaCodeNode[]> {
  try {
    return await neo4jClient.read<AreaCodeNode>(
      AREA_CODE_QUERIES.getAllAreaCodes,
      { projectId }
    );
  } catch (error) {
    console.error('Failed to fetch area codes:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch area codes');
  }
}

async function AreaCodesContent({ projectId }: { projectId: string }) {
  const areaCodes = await getAreaCodes(projectId);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Area Codes</h1>
        <p className="text-muted-foreground mt-2">
          Reference data for project area codes
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
            {areaCodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  No area codes found
                </TableCell>
              </TableRow>
            ) : (
              areaCodes.map((areaCode) => (
                <TableRow key={areaCode.id}>
                  <TableCell className="font-medium">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {areaCode.code}
                    </Badge>
                  </TableCell>
                  <TableCell>{areaCode.description}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Total: {areaCodes.length} area codes
      </div>
    </div>
  );
}

function AreaCodesSkeleton() {
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

export default async function AreaCodesPage({ params }: PageProps) {
  const { projectId } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<AreaCodesSkeleton />}>
        <AreaCodesContent projectId={projectId} />
      </Suspense>
    </div>
  );
}

