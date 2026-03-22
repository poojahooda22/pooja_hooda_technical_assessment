// store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from 'reactflow';
import type {
  Node,
  NodeChange,
  EdgeChange,
  Connection,
} from 'reactflow';
import type { NodeData, StoreState } from './types/store';

const HISTORY_LIMIT = 50;

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
  nodes: [],
  edges: [],
  nodeIDs: {},
  isDirty: false,
  past: [],
  future: [],

  // Push current {nodes, edges} onto past stack, clear future
  pushHistory: (): void => {
    const { nodes, edges, past } = get();
    set({
      past: [...past.slice(-(HISTORY_LIMIT - 1)), { nodes, edges }],
      future: [],
    });
  },

  undo: (): void => {
    const { past, nodes, edges, future } = get();
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    set({
      nodes: prev.nodes,
      edges: prev.edges,
      past: past.slice(0, -1),
      future: [{ nodes, edges }, ...future.slice(0, HISTORY_LIMIT - 1)],
      isDirty: true,
    });
  },

  redo: (): void => {
    const { future, nodes, edges, past } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      nodes: next.nodes,
      edges: next.edges,
      past: [...past, { nodes, edges }],
      future: future.slice(1),
      isDirty: true,
    });
  },

  getNodeID: (type: string): string => {
    const newIDs: Record<string, number> = { ...get().nodeIDs };
    if (newIDs[type] === undefined) {
      newIDs[type] = 0;
    }
    newIDs[type] += 1;
    set({ nodeIDs: newIDs });
    return `${type}-${newIDs[type]}`;
  },
  markClean: (): void => {
    set({ isDirty: false });
  },
  addNode: (node: Node<NodeData>): void => {
    get().pushHistory();
    set({
      nodes: [...get().nodes, node],
      isDirty: true,
    });
  },
  onNodesChange: (changes: NodeChange[]): void => {
    const removeChanges = changes.filter((c) => c.type === 'remove');
    const hasRemove = removeChanges.length > 0;
    const hasDragEnd = changes.some(
      (c) => c.type === 'position' && 'dragging' in c && c.dragging === false
    );

    // Push history before structural changes or drag-end
    if (hasRemove || hasDragEnd) {
      get().pushHistory();
    }

    const newNodes = applyNodeChanges(changes, get().nodes);

    // Clean up orphaned edges when nodes are removed
    if (hasRemove) {
      const removedIds = new Set(removeChanges.map((c) => (c as { id: string }).id));
      const newEdges = get().edges.filter(
        (e) => !removedIds.has(e.source) && !removedIds.has(e.target)
      );
      set({ nodes: newNodes, edges: newEdges, isDirty: true });
    } else {
      set({ nodes: newNodes });
    }
  },
  onEdgesChange: (changes: EdgeChange[]): void => {
    const hasStructuralChange = changes.some((c) => c.type === 'remove');

    if (hasStructuralChange) {
      get().pushHistory();
    }

    set({
      edges: applyEdgeChanges(changes, get().edges),
      ...(hasStructuralChange ? { isDirty: true } : {}),
    });
  },
  onConnect: (connection: Connection): void => {
    get().pushHistory();
    set({
      edges: addEdge(
        {
          ...connection,
          type: 'custom',
          animated: true,
          markerEnd: {
            type: MarkerType.Arrow,
            height: 16,
            width: 16,
            color: '#2970ff',
          },
        },
        get().edges,
      ),
      isDirty: true,
    });
  },
  updateNodeField: (nodeId: string, fieldName: string, fieldValue: unknown): void => {
    // No pushHistory here — history is pushed on field blur (action-level granularity)
    set({
      nodes: get().nodes.map((node: Node<NodeData>) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, [fieldName]: fieldValue } }
          : node,
      ),
      isDirty: true,
    });
  },
    }),
    {
      name: 'pipeline-canvas',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        nodeIDs: state.nodeIDs,
        // past and future are excluded — ephemeral, not persisted
      }),
    }
  )
);
