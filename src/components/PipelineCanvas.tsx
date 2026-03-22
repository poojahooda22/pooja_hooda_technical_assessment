// PipelineCanvas.tsx — Pipeline canvas with ReactFlow

import { useState, useRef, useCallback, useMemo } from 'react';
import ReactFlow, { Controls, Background, MiniMap, Connection, ReactFlowInstance, Node, ConnectionLineType, SelectionMode } from 'reactflow';
import { useStore } from '../store';
import { shallow } from 'zustand/shallow';
import { nodeTypes, getInitNodeData } from '../nodes/registry';
import { CustomEdge } from './CustomEdge';
import { AddNodeMenu } from './AddNodeMenu';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import type { StoreState, NodeData } from '../types/store';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };
const edgeTypes = { custom: CustomEdge };

const selector = (state: StoreState) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

// Track mouse position at module level — avoids re-renders on every mousemove
let lastMouse = { x: 0, y: 0 };

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

  // Add-node menu state (Blender Shift+A)
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [addMenuScreenPos, setAddMenuScreenPos] = useState({ x: 0, y: 0 });
  const addMenuFlowPos = useRef({ x: 0, y: 0 });

  const toggleAddMenu = useCallback(() => {
    setAddMenuOpen((prev) => {
      if (prev) return false;
      // Opening: capture cursor position and project to flow coordinates
      setAddMenuScreenPos({ x: lastMouse.x, y: lastMouse.y });
      if (reactFlowInstance && reactFlowWrapper.current) {
        const bounds = reactFlowWrapper.current.getBoundingClientRect();
        const projected = reactFlowInstance.project({
          x: lastMouse.x - bounds.left,
          y: lastMouse.y - bounds.top,
        });
        addMenuFlowPos.current = {
          x: Math.round(projected.x / gridSize) * gridSize,
          y: Math.round(projected.y / gridSize) * gridSize,
        };
      }
      return true;
    });
  }, [reactFlowInstance]);

  const closeAddMenu = useCallback(() => setAddMenuOpen(false), []);

  const handleAddNode = useCallback((type: string) => {
    const nodeID = getNodeID(type);
    const newNode = {
      id: nodeID,
      type,
      position: { ...addMenuFlowPos.current },
      data: getInitNodeData(nodeID, type) as NodeData,
    };
    addNode(newNode as Node<NodeData>);
    setAddMenuOpen(false);
  }, [getNodeID, addNode]);

  const shortcutOptions = useMemo(() => ({ onToggleAddMenu: toggleAddMenu }), [toggleAddMenu]);

  // Blender-inspired keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z, Ctrl+A, Space=pan, Shift+A=add)
  const { isSpaceHeld } = useKeyboardShortcuts(shortcutOptions);

  // Track mouse for Shift+A menu positioning
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    lastMouse.x = e.clientX;
    lastMouse.y = e.clientY;
  }, []);

  // Connection validation: O(1) checks only (no cycle detection — backend handles DAG)
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
    <div ref={reactFlowWrapper} className="flex-1 w-full" onMouseMove={onMouseMove}>
      <AddNodeMenu
        isOpen={addMenuOpen}
        screenPosition={addMenuScreenPos}
        onClose={closeAddMenu}
        onAddNode={handleAddNode}
      />
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
        selectionOnDrag={!isSpaceHeld}
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode="Shift"
        panOnDrag={isSpaceHeld ? [0, 1, 2] : [1, 2]}
        fitView
        className={`bg-background${isSpaceHeld ? ' space-pan-active' : ''}`}
      >
        <Background color="var(--rare-fg-faint)" gap={Math.round(20 / 1.618)} size={1.4} />
        <Controls position="bottom-left" />
        <MiniMap
          position="bottom-right"
          nodeColor={() => 'var(--rare-brand-200)'}
          nodeStrokeColor="var(--rare-border-secondary)"
          nodeStrokeWidth={1}
          className="!bg-background-node-header !border-secondary !shadow-xs"
        />

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-foreground-muted text-sm">
              Drag or click nodes from the toolbar to start building your pipeline
            </p>
          </div>
        )}
      </ReactFlow>
    </div>
  );
};
