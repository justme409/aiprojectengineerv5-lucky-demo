import { Suspense } from 'react';
import { MarkerType, Position, type Edge as FlowEdge, type Node as FlowNode } from '@xyflow/react';

import { LBSNodeType, LBS_NODE_QUERIES } from '@/schemas/neo4j';
import { neo4jClient } from '@/lib/neo4j';
import { Skeleton } from '@/components/ui/skeleton';

import LbsGraph, { type LbsNodeData } from './LbsGraph';

/**
 * Location Breakdown Structure (LBS) Page
 * 
 * Displays the hierarchical location breakdown structure for the project.
 * Shows project locations, chainages, and spatial organization.
 */

interface PageProps {
  params: Promise<{ projectId: string }>;
}

const NODE_WIDTH = 220;
const NODE_HEIGHT = 360;
const LEVEL_SPACING_Y = 450;
const NODE_SPACING_X = 260;

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'bigint') return Number(value);
  if (
    typeof value === 'object' &&
    value !== null &&
    'toNumber' in (value as Record<string, unknown>) &&
    typeof (value as { toNumber?: () => number }).toNumber === 'function'
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value ?? 0);
};

const formatChainage = (start?: unknown, end?: unknown) => {
  if (start == null && end == null) {
    return '—';
  }
  const from = Number.isFinite(Number(start)) ? Number(start) : undefined;
  const to = Number.isFinite(Number(end)) ? Number(end) : undefined;
  if (from == null && to == null) {
    return '—';
  }
  if (from != null && to != null) {
    if (from === to) {
      return `${from.toFixed(1)} m`;
    }
    return `${from.toFixed(1)} – ${to.toFixed(1)} m`;
  }
  return `${(from ?? to)?.toFixed(1)} m`;
};

const formatCoordinates = (coordinates?: { lat: number; lng: number } | null) => {
  if (!coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
    return '—';
  }
  return `${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}`;
};

const statusMap: Record<NonNullable<LBSNodeType['status']>, { label: string; color: string; muted: string }> = {
  not_started: { label: 'Not Started', color: '#334155', muted: '#64748b' },
  in_progress: { label: 'In Progress', color: '#1d4ed8', muted: '#60a5fa' },
  completed: { label: 'Completed', color: '#15803d', muted: '#86efac' },
  on_hold: { label: 'On Hold', color: '#b45309', muted: '#fcd34d' },
};

/**
 * Build hierarchy and calculate positions using simple tree layout
 * No D3 - just pure positioning logic
 */
const createGraphData = (nodes: LBSNodeType[]): { graphNodes: FlowNode<LbsNodeData>[]; graphEdges: FlowEdge[] } => {
  if (nodes.length === 0) {
    return { graphNodes: [], graphEdges: [] };
  }

  // Build parent-child map
  const nodesByCode = new Map<string, LBSNodeType>();
  const childrenByParent = new Map<string, LBSNodeType[]>();
  const rootNodes: LBSNodeType[] = [];

  nodes.forEach((node) => {
    nodesByCode.set(node.code, node);
    if (!node.parentCode) {
      rootNodes.push(node);
    } else {
      if (!childrenByParent.has(node.parentCode)) {
        childrenByParent.set(node.parentCode, []);
      }
      childrenByParent.get(node.parentCode)!.push(node);
    }
  });

  // Sort children by code for consistent ordering
  childrenByParent.forEach((children) => {
    children.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  });
  rootNodes.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

  // Calculate positions using simple tree layout
  interface PositionedNode {
    node: LBSNodeType;
    x: number;
    y: number;
  }

  const positionedNodes: PositionedNode[] = [];
  let currentXOffset = 0;

  const positionSubtree = (node: LBSNodeType, level: number, xOffset: number): number => {
    const children = childrenByParent.get(node.code) || [];
    const y = level * LEVEL_SPACING_Y;

    if (children.length === 0) {
      // Leaf node - position at current x offset
      positionedNodes.push({ node, x: xOffset, y });
      return xOffset + NODE_SPACING_X;
    }

    // Position children first
    let childX = xOffset;
    const childPositions: number[] = [];
    children.forEach((child) => {
      const childCenter = childX + NODE_WIDTH / 2;
      childPositions.push(childCenter);
      childX = positionSubtree(child, level + 1, childX);
    });

    // Position parent centered over children
    const leftmostChild = childPositions[0];
    const rightmostChild = childPositions[childPositions.length - 1];
    const parentX = (leftmostChild + rightmostChild) / 2 - NODE_WIDTH / 2;

    positionedNodes.push({ node, x: parentX, y });
    return childX;
  };

  // Position each root tree
  rootNodes.forEach((root) => {
    currentXOffset = positionSubtree(root, 0, currentXOffset);
  });

  // Create XYFlow nodes
  const graphNodes: FlowNode<LbsNodeData>[] = positionedNodes.map(({ node, x, y }) => {
    const statusKey = (node.status ?? 'not_started') as NonNullable<LBSNodeType['status']>;
    const statusMeta = statusMap[statusKey] ?? statusMap.not_started;

    return {
      id: node.code,
      position: { x, y },
      data: {
        code: node.code,
        name: node.name,
        level: toNumber(node.level),
        typeLabel: node.type.replace(/_/g, ' '),
        statusLabel: statusMeta.label,
        statusKey,
        statusColor: statusMeta.color,
        statusMutedColor: statusMeta.muted,
        chainageDisplay: formatChainage(node.chainageStart, node.chainageEnd),
        coordinateDisplay: formatCoordinates(node.coordinates ?? undefined),
        description: node.description,
      },
      type: 'lbsNode',
      draggable: true,
      selectable: true,
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    };
  });

  // Create edges from parent-child relationships
  const graphEdges: FlowEdge[] = [];
  nodes.forEach((node) => {
    if (node.parentCode && nodesByCode.has(node.parentCode)) {
      const label = node.type ? node.type.replace(/_/g, ' ') : undefined;

      graphEdges.push({
        id: `${node.parentCode}-${node.code}`,
        source: node.parentCode,
        target: node.code,
        type: 'smoothstep',
        animated: true,
        label,
        labelBgPadding: [8, 4] as [number, number],
        labelBgBorderRadius: 4,
        labelBgStyle: {
          fill: 'rgba(15, 23, 42, 0.12)',
          color: '#0f172a',
        },
        style: {
          strokeWidth: 3,
          stroke: '#0f172a',
          opacity: 0.9,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#0f172a',
          width: 20,
          height: 20,
        },
      });
    }
  });

  return { graphNodes, graphEdges };
};

async function getLBSNodes(projectId: string): Promise<LBSNodeType[]> {
  try {
    const records = await neo4jClient.read<LBSNodeType>(
      LBS_NODE_QUERIES.getAll,
      { projectId }
    );
    return records.map((node) => ({
      ...node,
      level: toNumber(node.level),
      chainageStart: node.chainageStart != null ? toNumber(node.chainageStart) : undefined,
      chainageEnd: node.chainageEnd != null ? toNumber(node.chainageEnd) : undefined,
    }));
  } catch (error) {
    console.error('Failed to fetch LBS nodes:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch LBS nodes');
  }
}

async function LBSContent({ projectId }: { projectId: string }) {
  const nodes = await getLBSNodes(projectId);
  const { graphNodes, graphEdges } = createGraphData(nodes);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Location Breakdown Structure</h1>
        <p className="text-muted-foreground mt-2">
          Interactive spatial hierarchy sourced from Neo4j (sites, zones, chainages, layers)
        </p>
      </div>
      {graphNodes.length === 0 ? (
        <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
          No LBS hierarchy available
        </div>
      ) : (
        <LbsGraph nodes={graphNodes} edges={graphEdges} />
      )}
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

