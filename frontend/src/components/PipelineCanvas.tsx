// PipelineCanvas.tsx — Pipeline canvas with ReactFlow

import { useState, useRef, useCallback } from 'react';
import ReactFlow, { Controls, Background, MiniMap, Connection, ReactFlowInstance, Node, ConnectionLineType } from 'reactflow';
import { useStore } from '../store';
import { shallow } from 'zustand/shallow';
import { nodeTypes, nodeConfigs, getInitNodeData } from '../nodes/registry';
import { CustomEdge } from './CustomEdge';
import { CATEGORY_THEME } from '../constants/theme';
import type { StoreState, NodeData } from '../types/store';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };
const edgeTypes = { custom: CustomEdge };

// Module-level lookup for MiniMap node colors (avoids .find() per node per render)
const NODE_COLOR_MAP: Record<string, string> = Object.fromEntries(
  nodeConfigs.map((c) => [c.type, CATEGORY_THEME[c.category]?.accent || CATEGORY_THEME.utility.accent])
);

const selector = (state: StoreState) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

export const PipelineCanvas = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const {
    nodes,
    edges,
    getNodeID,
    addNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useStore(selector, shallow);

  // Connection validation: O(1) checks only (no cycle detection — backend handles DAG)
  // Uses useStore.getState() to read edges at call-time instead of reactive dependency.
  // This keeps the callback reference stable (empty deps) and prevents ReactFlow's
  // StoreUpdater from re-syncing on every edges change.
  // Allows fan-in (multiple sources -> one target handle) — only blocks truly identical edges.
  const isValidConnection = useCallback(
    (connection: Connection): boolean => {
      if (connection.source === connection.target) return false;
      const currentEdges = useStore.getState().edges;
      const duplicate = currentEdges.some(
        (e) =>
          e.source === connection.source &&
          e.sourceHandle === connection.sourceHandle &&
          e.target === connection.target &&
          e.targetHandle === connection.targetHandle
      );
      return !duplicate;
    },
    []
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds || !reactFlowInstance) return;

      if (event?.dataTransfer?.getData('application/reactflow')) {
        const appData = JSON.parse(
          event.dataTransfer.getData('application/reactflow')
        ) as { nodeType?: string };
        const type = appData?.nodeType;
        if (typeof type === 'undefined' || !type) return;

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const nodeID = getNodeID(type);
        const newNode = {
          id: nodeID,
          type,
          position,
          data: getInitNodeData(nodeID, type) as NodeData,
        };

        addNode(newNode as Node<NodeData>);
      }
    },
    [reactFlowInstance, getNodeID, addNode]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div ref={reactFlowWrapper} className="flex-1 w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: 'custom' }}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        connectionLineType={ConnectionLineType.SmoothStep}
        isValidConnection={isValidConnection}
        deleteKeyCode={['Delete', 'Backspace']}
        fitView
        className="bg-background-secondary"
      >
        <Background color="var(--rare-fg-faint)" gap={gridSize} size={1} />
        <Controls position="bottom-left" className="!bg-background !border-secondary !shadow-xs" />
        <MiniMap
          position="bottom-right"
          nodeColor={useCallback((node: Node) => NODE_COLOR_MAP[node.type ?? ''] || CATEGORY_THEME.utility.accent, [])}
          className="!bg-background-alt !border-secondary !shadow-xs"
        />

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-foreground-muted text-sm">
              Drag nodes from the toolbar to start building your pipeline
            </p>
          </div>
        )}
      </ReactFlow>
    </div>
  );
};
