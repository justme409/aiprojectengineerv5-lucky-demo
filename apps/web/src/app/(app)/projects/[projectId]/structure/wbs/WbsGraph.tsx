'use client';

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
  useReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

export interface WbsNodeData {
  code: string;
  name: string;
  level: number;
  deliverable: string;
  category: string;
  statusLabel: string;
  statusKey: string;
  statusColor: string;
  statusMutedColor: string;
  progressValue: number;
  progressDisplay: string;
  plannedStart: string;
  plannedEnd: string;
}

interface WbsGraphProps {
  nodes: Node<WbsNodeData>[];
  edges: Edge[];
}

const WbsNode = memo(({ data }: NodeProps<WbsNodeData>) => {
  const accent = data.statusColor ?? '#0f172a';
  const muted = data.statusMutedColor ?? '#94a3b8';
  const gradient = `linear-gradient(135deg, ${accent} 0%, ${muted} 100%)`;

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        className="h-3 w-3 border-2 border-background bg-primary"
        isConnectable={false}
      />
      <div className="min-w-[260px] max-w-[300px] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl ring-1 ring-black/5">
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

          <div>
            <h3 className="text-sm font-semibold leading-tight text-foreground">{data.name}</h3>
            <span
              className="mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{
                color: accent,
                backgroundColor: `${muted}26`,
              }}
            >
              {data.statusLabel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-0.5">
              <p className="font-medium text-foreground/70">Deliverable</p>
              <p className="capitalize text-foreground">{data.deliverable}</p>
            </div>
            <div className="space-y-0.5">
              <p className="font-medium text-foreground/70">Category</p>
              <p className="capitalize text-foreground">{data.category}</p>
            </div>
            <div className="space-y-0.5">
              <p className="font-medium text-foreground/70">Planned Start</p>
              <p className="text-foreground">{data.plannedStart}</p>
            </div>
            <div className="space-y-0.5">
              <p className="font-medium text-foreground/70">Planned Finish</p>
              <p className="text-foreground">{data.plannedEnd}</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Progress</span>
              <span className="font-medium text-foreground">{data.progressDisplay}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, Math.max(0, data.progressValue))}%`,
                  background: gradient,
                }}
              />
            </div>
          </div>
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

WbsNode.displayName = 'WbsNode';

const defaultEdgeOptions = {
  type: 'smoothstep' as const,
};

function WbsGraphInner({ nodes: initialNodes, edges: initialEdges }: WbsGraphProps) {
  const memoizedNodes = useMemo(() => initialNodes, [initialNodes]);
  const memoizedEdges = useMemo(() => initialEdges, [initialEdges]);
  const nodeTypes = useMemo(() => ({ wbsNode: WbsNode }), []);
  const { fitView } = useReactFlow<WbsNodeData>();

  const [nodes, , onNodesChange] = useNodesState<WbsNodeData>(memoizedNodes);
  const [edges, , onEdgesChange] = useEdgesState(memoizedEdges);

  useEffect(() => {
    if (memoizedNodes.length === 0) {
      return;
    }

    const timeout = window.setTimeout(() => {
      fitView({ padding: 0.2, duration: 400 });
    }, 50);

    return () => window.clearTimeout(timeout);
  }, [memoizedNodes, memoizedEdges, fitView]);

  return (
    <div className="h-[680px] w-full overflow-hidden rounded-2xl border border-border/60 bg-muted/20 p-3 shadow-inner">
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
        fitViewOptions={{ padding: 0.2, minZoom: 0.4, maxZoom: 1.2 }}
        panOnScroll={false}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        minZoom={0.35}
        maxZoom={1.6}
        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
        <MiniMap zoomable pannable className="!bg-card/80" maskColor="rgba(148, 163, 184, 0.15)" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

export function WbsGraph(props: WbsGraphProps) {
  return (
    <ReactFlowProvider>
      <WbsGraphInner {...props} />
    </ReactFlowProvider>
  );
}

export default WbsGraph;

