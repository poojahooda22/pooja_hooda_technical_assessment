// store.ts

import { create } from "zustand";
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

export const useStore = create<StoreState>()((set, get) => ({
  nodes: [],
  edges: [],
  nodeIDs: {},
  isDirty: false,
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
    set({
      nodes: [...get().nodes, node],
      isDirty: true,
    });
  },
  onNodesChange: (changes: NodeChange[]): void => {
    // Only mark dirty for structural changes (add/remove), not visual ones (position/select/dimensions)
    const hasStructuralChange = changes.some((c) => c.type === 'remove');
    set({
      nodes: applyNodeChanges(changes, get().nodes),
      ...(hasStructuralChange ? { isDirty: true } : {}),
    });
  },
  onEdgesChange: (changes: EdgeChange[]): void => {
    // Only mark dirty for structural changes (remove), not visual ones (select)
    const hasStructuralChange = changes.some((c) => c.type === 'remove');
    set({
      edges: applyEdgeChanges(changes, get().edges),
      ...(hasStructuralChange ? { isDirty: true } : {}),
    });
  },
  onConnect: (connection: Connection): void => {
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
    set({
      nodes: get().nodes.map((node: Node<NodeData>) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, [fieldName]: fieldValue } }
          : node,
      ),
      isDirty: true,
    });
  },
}));
