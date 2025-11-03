import { Suspense } from 'react';
import { WBSNodeType, WBS_NODE_QUERIES } from '@/schemas/neo4j';
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
 * Work Breakdown Structure (WBS) Page
 * 
 * Displays the hierarchical work breakdown structure for the project.
 * Shows work packages and their relationships.
 */

interface PageProps {
  params: Promise<{ projectId: string }>;
}

async function getWBSNodes(projectId: string): Promise<WBSNodeType[]> {
  try {
    return await neo4jClient.read<WBSNodeType>(
      WBS_NODE_QUERIES.getAllNodes,
      { projectId }
    );
  } catch (error) {
    console.error('Failed to fetch WBS nodes:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch WBS nodes');
  }
}

async function WBSContent({ projectId }: { projectId: string }) {
  const nodes = await getWBSNodes(projectId);
  
  // Sort by code for hierarchical display
  const sortedNodes = [...nodes].sort((a, b) => a.code.localeCompare(b.code));
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Work Breakdown Structure</h1>
        <p className="text-muted-foreground mt-2">
          Hierarchical breakdown of project work packages
        </p>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Parent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedNodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No WBS nodes found
                </TableCell>
              </TableRow>
            ) : (
              sortedNodes.map((node) => (
                <TableRow key={node.id}>
                  <TableCell className="font-medium">
                    <Badge variant="outline" className="font-mono">
                      {node.code}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div style={{ paddingLeft: `${node.level * 16}px` }}>
                      {node.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">Level {node.level}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {node.parentId || '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Total: {nodes.length} WBS nodes
      </div>
    </div>
  );
}

function WBSSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-80" />
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

export default async function WBSPage({ params }: PageProps) {
  const { projectId } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<WBSSkeleton />}>
        <WBSContent projectId={projectId} />
      </Suspense>
    </div>
  );
}

