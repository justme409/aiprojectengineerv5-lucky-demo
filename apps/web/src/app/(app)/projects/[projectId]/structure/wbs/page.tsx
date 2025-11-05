import { Suspense } from 'react';
import { hierarchy, tree } from 'd3-hierarchy';
import { MarkerType, type Edge as FlowEdge, type Node as FlowNode } from '@xyflow/react';

import { WBSNodeType, WBS_NODE_QUERIES } from '@/schemas/neo4j';
import { neo4jClient } from '@/lib/neo4j';
import { Skeleton } from '@/components/ui/skeleton';

import WbsGraph, { type WbsNodeData } from './WbsGraph';

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'bigint') return Number(value);
  if (
    typeof value === 'object' &&
    value !== null &&
    'low' in (value as Record<string, unknown>) &&
    'high' in (value as Record<string, unknown>)
  ) {
    const integer = value as { low: number; high: number };
    return integer.high * 2 ** 32 + integer.low;
  }
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

const toDate = (value?: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (
    typeof value === 'object' &&
    value !== null &&
    'year' in (value as Record<string, unknown>) &&
    'month' in (value as Record<string, unknown>) &&
    'day' in (value as Record<string, unknown>)
  ) {
    const temporal = value as {
      year: unknown;
      month: unknown;
      day: unknown;
      hour?: unknown;
      minute?: unknown;
      second?: unknown;
      nanosecond?: unknown;
    };
    return new Date(
      Date.UTC(
        toNumber(temporal.year),
        toNumber(temporal.month) - 1,
        toNumber(temporal.day),
        toNumber(temporal.hour ?? 0),
        toNumber(temporal.minute ?? 0),
        toNumber(temporal.second ?? 0),
        temporal.nanosecond ? Math.floor(toNumber(temporal.nanosecond) / 1e6) : 0,
      ),
    );
  }

  const date = new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value?: unknown) => {
  try {
    const date = toDate(value);
    return date ? date.toLocaleDateString() : '-';
  } catch (error) {
    console.warn('Unable to format date value', value, error);
    return '-';
  }
};

const formatPercent = (value?: number | null) => {
  if (value === null || value === undefined) return '-';
  return `${Math.round(value)}%`;
};

const statusConfig: Record<NonNullable<WBSNodeType['status']>, { label: string; variant: 'secondary' | 'default' | 'success' | 'destructive' | 'outline' }> = {
  not_started: { label: 'Not Started', variant: 'secondary' },
  in_progress: { label: 'In Progress', variant: 'default' },
  completed: { label: 'Completed', variant: 'success' },
  on_hold: { label: 'On Hold', variant: 'outline' },
};

const statusColorMap: Record<NonNullable<WBSNodeType['status']>, { primary: string; muted: string }> = {
  not_started: { primary: '#334155', muted: '#64748b' },
  in_progress: { primary: '#1d4ed8', muted: '#60a5fa' },
  completed: { primary: '#15803d', muted: '#86efac' },
  on_hold: { primary: '#b45309', muted: '#fcd34d' },
};

type HierarchyDatum = {
  node: WBSNodeType | null;
  children: HierarchyDatum[];
};

const buildHierarchy = (nodes: WBSNodeType[]): HierarchyDatum[] => {
  const nodeMap = new Map<string, HierarchyDatum>();

  nodes.forEach((node) => {
    nodeMap.set(node.code, {
      node,
      children: [],
    });
  });

  const roots: HierarchyDatum[] = [];

  nodeMap.forEach((entry) => {
    const parentCode = entry.node?.parentCode;
    if (parentCode && nodeMap.has(parentCode)) {
      nodeMap.get(parentCode)?.children.push(entry);
    } else {
      roots.push(entry);
    }
  });

  const sortBranch = (branch: HierarchyDatum) => {
    branch.children.sort((a, b) => {
      const codeA = a.node?.code ?? '';
      const codeB = b.node?.code ?? '';
      return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
    });
    branch.children.forEach(sortBranch);
  };

  roots.sort((a, b) => {
    const codeA = a.node?.code ?? '';
    const codeB = b.node?.code ?? '';
    return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
  });
  roots.forEach(sortBranch);

  return roots;
};

const NODE_WIDTH = 240;
const NODE_HEIGHT = 440;
const SIBLING_SPACING = 1.35;
const CROSS_LEVEL_SPACING = 1.7;
const HORIZONTAL_PADDING = 180;
const VERTICAL_PADDING = 220;

const createGraphData = (nodes: WBSNodeType[]): { graphNodes: FlowNode<WbsNodeData>[]; graphEdges: FlowEdge[] } => {
  const roots = buildHierarchy(nodes);

  if (roots.length === 0) {
    return { graphNodes: [], graphEdges: [] };
  }

  const virtualRoot: HierarchyDatum = {
    node: null,
    children: roots,
  };

  const nodeSize: [number, number] = [NODE_WIDTH, NODE_HEIGHT];
  const layout = tree<HierarchyDatum>()
    .nodeSize(nodeSize)
    .separation((a, b) => (a.parent === b.parent ? SIBLING_SPACING : CROSS_LEVEL_SPACING))(
      hierarchy(virtualRoot, (datum) => datum.children),
    );

  const descendants = layout.descendants().filter((d) => d.data.node !== null);

  if (descendants.length === 0) {
    return { graphNodes: [], graphEdges: [] };
  }

  const minX = Math.min(...descendants.map((d) => d.x));
  const paddingX = HORIZONTAL_PADDING;
  const paddingY = VERTICAL_PADDING;

  const graphNodes: FlowNode<WbsNodeData>[] = descendants.map((descendant) => {
    const node = descendant.data.node as WBSNodeType;
    const statusKey = (node.status ?? 'not_started') as keyof typeof statusConfig;
    const statusMeta = statusConfig[statusKey] ?? {
      label: 'Status Unknown',
      variant: 'secondary',
    };
    const colors = statusColorMap[statusKey] ?? { primary: '#334155', muted: '#94a3b8' };
    const progressValue = typeof node.percentComplete === 'number' ? node.percentComplete : 0;
    return {
      id: node.code,
      position: {
        x: descendant.x - minX + paddingX,
        y: descendant.y + paddingY,
      },
      data: {
        code: node.code,
        name: node.name,
        level: node.level,
        deliverable: node.deliverableType ? node.deliverableType.replace(/_/g, ' ') : 'Not specified',
        category: node.category ? node.category.replace(/_/g, ' ') : 'General',
        statusLabel: statusMeta.label,
        statusKey,
        statusColor: colors.primary,
        statusMutedColor: colors.muted,
        progressValue: Math.max(0, Math.min(100, progressValue)),
        progressDisplay: formatPercent(progressValue),
        plannedStart: formatDate(node.plannedStartDate),
        plannedEnd: formatDate(node.plannedEndDate),
      },
      type: 'wbsNode',
      draggable: true,
      selectable: true,
      sourcePosition: 'bottom',
      targetPosition: 'top',
      style: {
        width: NODE_WIDTH - 24,
      },
    } satisfies FlowNode<WbsNodeData>;
  });

  const graphEdges: FlowEdge[] = layout
    .links()
    .filter((link) => link.source.data.node && link.target.data.node)
    .map((link) => {
      const sourceNode = link.source.data.node as WBSNodeType;
      const targetNode = link.target.data.node as WBSNodeType;

      const label = targetNode.deliverableType
        ? targetNode.deliverableType.replace(/_/g, ' ')
        : undefined;

      return {
        id: `${sourceNode.code}-${targetNode.code}`,
        source: sourceNode.code,
        target: targetNode.code,
        type: 'smoothstep',
        animated: true,
        label,
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
        labelBgStyle: {
          fill: 'rgba(15, 23, 42, 0.12)',
          color: '#0f172a',
        },
        style: {
          strokeWidth: 3,
          stroke: '#0f172a',
          opacity: 0.95,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#0f172a',
          width: 22,
          height: 22,
        },
      };
    });

  return { graphNodes, graphEdges };
};

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
    const records = await neo4jClient.read<WBSNodeType>(
      WBS_NODE_QUERIES.getAll,
      { projectId }
    );
    return records.map((node) => {
      const raw = node as unknown as Record<string, unknown>;
      return {
        ...node,
        level: toNumber(raw.level ?? node.level),
        percentComplete:
          raw.percentComplete === undefined || raw.percentComplete === null
            ? node.percentComplete
            : toNumber(raw.percentComplete),
        plannedStartDate: toDate(raw.plannedStartDate ?? node.plannedStartDate) ?? undefined,
        plannedEndDate: toDate(raw.plannedEndDate ?? node.plannedEndDate) ?? undefined,
      };
    });
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
  const { graphNodes, graphEdges } = createGraphData(nodes);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Work Breakdown Structure</h1>
        <p className="text-muted-foreground mt-2">
          Interactive hierarchy showing parent-child relationships, deliverable grouping, and schedule metadata sourced from Neo4j.
        </p>
      </div>
      {graphNodes.length === 0 ? (
        <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
          No WBS hierarchy available
        </div>
      ) : (
        <WbsGraph nodes={graphNodes} edges={graphEdges} />
      )}
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

