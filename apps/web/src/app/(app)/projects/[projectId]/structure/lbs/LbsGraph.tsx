"use client";

import { memo, useEffect, useMemo } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

export interface LbsNodeData {
  code: string;
  name: string;
  level: number;
  typeLabel: string;
  statusLabel: string;
  statusKey: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  statusColor: string;
  statusMutedColor: string;
  chainageDisplay: string;
  coordinateDisplay: string;
  description?: string;
}

interface LbsGraphProps {
  nodes: Node<LbsNodeData>[];
  edges: Edge[];
}

const statusColorMap: Record<LbsNodeData['statusKey'], { primary: string; muted: string }> = {
  not_started: { primary: '#334155', muted: '#64748b' },
  in_progress: { primary: '#1d4ed8', muted: '#60a5fa' },
  completed: { primary: '#15803d', muted: '#86efac' },
  on_hold: { primary: '#b45309', muted: '#fcd34d' },
};

const LbsNode = memo(({ data }: NodeProps<LbsNodeData>) => {
  const status = statusColorMap[data.statusKey] ?? statusColorMap.not_started;
  const accent = data.statusColor || status.primary;
  const muted = data.statusMutedColor || status.muted;
  const gradient = `linear-gradient(135deg, ${accent} 0%, ${muted} 100%)`;

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        className="h-3 w-3 border-2 border-background bg-primary"
        isConnectable={false}
      />
      <div className="min-w-[240px] max-w-[280px] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl ring-1 ring-black/5">
        <div className="h-2 w-full" style={{ background: gradient }} />
        <div className="space-y-3 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {data.code}
            </span>
            <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              Level {data.level}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold leading-tight text-foreground">
              {data.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize"
                style={{
                  color: accent,
                  backgroundColor: `${muted}26`,
                }}
              >
                {data.typeLabel}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">
                {data.statusLabel}
              </span>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-0.5">
              <dt className="font-medium text-foreground/70">Chainage</dt>
              <dd className="text-foreground">{data.chainageDisplay}</dd>
            </div>
            <div className="space-y-0.5">
              <dt className="font-medium text-foreground/70">Coordinates</dt>
              <dd className="text-foreground">{data.coordinateDisplay}</dd>
            </div>
            {data.description ? (
              <div className="col-span-2 space-y-0.5">
                <dt className="font-medium text-foreground/70">Description</dt>
                <dd className="text-foreground text-[11px] leading-snug">
                  {data.description}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="h-3 w-3 border-2 border-background bg-primary"
        isConnectable={false}
      />
    </div>
  );
});

LbsNode.displayName = 'LbsNode';

const defaultEdgeOptions = {
  type: 'smoothstep' as const,
};

function LbsGraphInner({ nodes: initialNodes, edges: initialEdges }: LbsGraphProps) {
  const memoizedNodes = useMemo(() => initialNodes, [initialNodes]);
  const memoizedEdges = useMemo(() => initialEdges, [initialEdges]);
  const nodeTypes = useMemo(() => ({ lbsNode: LbsNode }), []);
  const { fitView } = useReactFlow<LbsNodeData>();

  const [nodes, , onNodesChange] = useNodesState<LbsNodeData>(memoizedNodes);
  const [edges, , onEdgesChange] = useEdgesState(memoizedEdges);

  useEffect(() => {
    if (memoizedNodes.length === 0) {
      return;
    }

    const timeout = window.setTimeout(() => {
      fitView({ padding: 0.25, duration: 400 });
    }, 50);

    return () => window.clearTimeout(timeout);
  }, [memoizedNodes, memoizedEdges, fitView]);

  return (
    <div className="h-[720px] w-full overflow-hidden rounded-2xl border border-border/60 bg-muted/20 p-3 shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        fitView
        fitViewOptions={{ padding: 0.25, minZoom: 0.35, maxZoom: 1.2 }}
        panOnScroll={false}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        minZoom={0.3}
        maxZoom={1.6}
        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={26} size={1} />
        <MiniMap zoomable pannable className="!bg-card/80" maskColor="rgba(148, 163, 184, 0.15)" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

export function LbsGraph(props: LbsGraphProps) {
  return (
    <ReactFlowProvider>
      <LbsGraphInner {...props} />
    </ReactFlowProvider>
  );
}

export default LbsGraph;


