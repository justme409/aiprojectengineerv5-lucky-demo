import { Suspense } from 'react';
import { LBSNodeType, LBS_NODE_QUERIES } from '@/schemas/neo4j/lbs-node.schema';
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
import { MapPin } from 'lucide-react';

/**
 * Location Breakdown Structure (LBS) Page
 * 
 * Displays the hierarchical location breakdown structure for the project.
 * Shows project locations, chainages, and spatial organization.
 */

interface PageProps {
  params: Promise<{ projectId: string }>;
}

async function getLBSNodes(projectId: string): Promise<LBSNodeType[]> {
  try {
    return await neo4jClient.read<LBSNodeType>(
      LBS_NODE_QUERIES.getAllNodes,
      { projectId }
    );
  } catch (error) {
    console.error('Failed to fetch LBS nodes:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch LBS nodes');
  }
}

async function LBSContent({ projectId }: { projectId: string }) {
  const nodes = await getLBSNodes(projectId);
  
  // Sort by code for hierarchical display
  const sortedNodes = [...nodes].sort((a, b) => a.code.localeCompare(b.code));
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Location Breakdown Structure</h1>
        <p className="text-muted-foreground mt-2">
          Hierarchical breakdown of project locations and areas
        </p>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Chainage</TableHead>
              <TableHead>Coordinates</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedNodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No LBS nodes found
                </TableCell>
              </TableRow>
            ) : (
              sortedNodes.map((node) => (
                <TableRow key={node.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline" className="font-mono">
                        {node.code}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {node.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{node.type}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {node.chainage || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">
                    {node.coordinates || '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Total: {nodes.length} LBS nodes
      </div>
    </div>
  );
}

function LBSSkeleton() {
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

export default async function LBSPage({ params }: PageProps) {
  const { projectId } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<LBSSkeleton />}>
        <LBSContent projectId={projectId} />
      </Suspense>
    </div>
  );
}

