import React, { memo } from 'react';
import BaseNode from './BaseNode';
import type { NodeConfig } from '../types/nodeConfig';

import inputConfig from './configs/inputNode.config';
import outputConfig from './configs/outputNode.config';
import llmConfig from './configs/llmNode.config';
import textConfig from './configs/textNode.config';
import noteConfig from './configs/noteNode.config';
import apiRequestConfig from './configs/apiRequestNode.config';
import conditionalConfig from './configs/conditionalNode.config';
import timerConfig from './configs/timerNode.config';
import mergeConfig from './configs/mergeNode.config';
import twitterApiConfig from './configs/twitterApiNode.config';
import pythonConfig from './configs/pythonNode.config';
import { dummyConfigs } from './configs/dummyNodes.config';

// All node configurations — add new nodes here
const allConfigs: NodeConfig[] = [
  inputConfig,
  outputConfig,
  llmConfig,
  textConfig,
  noteConfig,
  apiRequestConfig,
  conditionalConfig,
  timerConfig,
  mergeConfig,
  twitterApiConfig,
  pythonConfig,
  ...dummyConfigs,
];

interface BaseNodeWrapperProps {
  id: string;
  data: Record<string, unknown>;
  selected: boolean;
}

// Factory: wraps each config in a memoized BaseNode component
const createNodeComponent = (config: NodeConfig): React.ComponentType<BaseNodeWrapperProps> =>
  memo(({ id, data, selected }: BaseNodeWrapperProps) => (
    <BaseNode config={config} id={id} data={data} selected={selected} />
  ));

// Module-level constant — stable reference prevents ReactFlow remounting warning
export const nodeTypes: Record<string, React.ComponentType<any>> = Object.fromEntries(
  allConfigs.map((cfg) => [cfg.type, createNodeComponent(cfg)])
);

// Build default data from node config
export const getInitNodeData = (nodeID: string, type: string): Record<string, unknown> => {
  const config = allConfigs.find((c) => c.type === type);
  const nodeData: Record<string, unknown> = { id: nodeID, nodeType: type };
  if (config?.fields) {
    config.fields.forEach((field) => {
      const val = typeof field.defaultValue === 'function'
        ? field.defaultValue(nodeID)
        : (field.defaultValue ?? '');
      nodeData[field.name] = val;
    });
  }
  return nodeData;
};

// Exported for toolbar auto-generation
export const nodeConfigs: NodeConfig[] = allConfigs;
