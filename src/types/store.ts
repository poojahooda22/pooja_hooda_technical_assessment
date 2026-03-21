// store.ts — Type definitions for Zustand store

import { Node, Edge, NodeChange, EdgeChange, Connection } from 'reactflow';

export interface NodeData extends Record<string, unknown> {
  id: string;
  nodeType: string;
}

export interface StoreState {
  nodes: Node<NodeData>[];
  edges: Edge[];
  nodeIDs: Record<string, number>;
  getNodeID: (type: string) => string;
  addNode: (node: Node<NodeData>) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  updateNodeField: (nodeId: string, fieldName: string, fieldValue: unknown) => void;
  isDirty: boolean;
  markClean: () => void;
}
