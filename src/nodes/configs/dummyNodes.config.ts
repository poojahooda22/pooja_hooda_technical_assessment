// dummyNodes.config.ts — Placeholder nodes to fill out each category for UI demo

import type { NodeConfig } from '../../types/nodeConfig';

// ── General (need 2 more) ────────────────────────────────────
const variableConfig: NodeConfig = {
  type: 'variable',
  label: 'Variable',
  icon: 'Variable',
  category: 'general',
  handles: [
    { type: 'target', position: 'left', id: 'input', label: 'Input', style: { top: '50%' } },
    { type: 'source', position: 'right', id: 'output', label: 'Output', style: { top: '50%' } },
  ],
  fields: [
    { name: 'varName', type: 'text', label: 'Name', defaultValue: 'myVar' },
    { name: 'varValue', type: 'text', label: 'Value', defaultValue: '' },
  ],
};

const constantConfig: NodeConfig = {
  type: 'constant',
  label: 'Constant',
  icon: 'Hash',
  category: 'general',
  handles: [
    { type: 'source', position: 'right', id: 'output', label: 'Output', style: { top: '50%' } },
  ],
  fields: [
    { name: 'value', type: 'text', label: 'Value', defaultValue: '0' },
    { name: 'type', type: 'select', label: 'Type', options: [
      { value: 'string', label: 'String' },
      { value: 'number', label: 'Number' },
      { value: 'boolean', label: 'Boolean' },
    ], defaultValue: 'string' },
  ],
};

// ── LLM (need 4 more) ───────────────────────────────────────
const chatConfig: NodeConfig = {
  type: 'chat',
  label: 'Chat',
  icon: 'MessageSquare',
  category: 'llm',
  handles: [
    { type: 'target', position: 'left', id: 'input', label: 'Input', style: { top: '50%' } },
    { type: 'source', position: 'right', id: 'output', label: 'Output', style: { top: '50%' } },
  ],
  fields: [
    { name: 'message', type: 'textarea', label: 'Message', defaultValue: '' },
  ],
};

const embeddingConfig: NodeConfig = {
  type: 'embedding',
  label: 'Embedding',
  icon: 'Layers',
  category: 'llm',
  handles: [
    { type: 'target', position: 'left', id: 'text', label: 'Text', style: { top: '50%' } },
    { type: 'source', position: 'right', id: 'vector', label: 'Vector', style: { top: '50%' } },
  ],
  fields: [
    { name: 'model', type: 'select', label: 'Model', options: [
      { value: 'text-embedding-3-small', label: 'Embedding 3 Small' },
      { value: 'text-embedding-3-large', label: 'Embedding 3 Large' },
    ], defaultValue: 'text-embedding-3-small' },
  ],
};

const summarizerConfig: NodeConfig = {
  type: 'summarizer',
  label: 'Summarizer',
  icon: 'FileText',
  category: 'llm',
  handles: [
    { type: 'target', position: 'left', id: 'input', label: 'Input', style: { top: '50%' } },
    { type: 'source', position: 'right', id: 'summary', label: 'Summary', style: { top: '50%' } },
  ],
  fields: [
    { name: 'maxLength', type: 'slider', label: 'Max Length', defaultValue: 200, min: 50, max: 1000 },
  ],
};

const classifierConfig: NodeConfig = {
  type: 'classifier',
  label: 'Classifier',
  icon: 'Tags',
  category: 'llm',
  handles: [
    { type: 'target', position: 'left', id: 'input', label: 'Input', style: { top: '50%' } },
    { type: 'source', position: 'right', id: 'label', label: 'Label', style: { top: '50%' } },
  ],
  fields: [
    { name: 'categories', type: 'textarea', label: 'Categories', defaultValue: 'positive\nnegative\nneutral' },
  ],
};

// ── Logic (need 4 more) ──────────────────────────────────────
const switchConfig: NodeConfig = {
  type: 'switch',
  label: 'Switch',
  icon: 'ArrowLeftRight',
  category: 'logic',
  handles: [
    { type: 'target', position: 'left', id: 'input', label: 'Input', style: { top: '50%' } },
    { type: 'source', position: 'right', id: 'case1', label: 'Case 1', style: { top: 'calc(50% - 15px)' } },
    { type: 'source', position: 'right', id: 'case2', label: 'Case 2', style: { top: 'calc(50% + 15px)' } },
  ],
  fields: [
    { name: 'expression', type: 'text', label: 'Expression', defaultValue: '' },
  ],
};

const loopConfig: NodeConfig = {
  type: 'loop',
  label: 'Loop',
  icon: 'Repeat',
  category: 'logic',
  handles: [
    { type: 'target', position: 'left', id: 'input', label: 'Input', style: { top: '50%' } },
    { type: 'source', position: 'right', id: 'output', label: 'Output', style: { top: '50%' } },
  ],
  fields: [
    { name: 'iterations', type: 'slider', label: 'Iterations', defaultValue: 5, min: 1, max: 100 },
  ],
};

const filterConfig: NodeConfig = {
  type: 'filter',
  label: 'Filter',
  icon: 'Filter',
  category: 'logic',
  handles: [
    { type: 'target', position: 'left', id: 'input', label: 'Input', style: { top: '50%' } },
    { type: 'source', position: 'right', id: 'pass', label: 'Pass', style: { top: 'calc(50% - 15px)' } },
    { type: 'source', position: 'right', id: 'reject', label: 'Reject', style: { top: 'calc(50% + 15px)' } },
  ],
  fields: [
    { name: 'condition', type: 'text', label: 'Condition', defaultValue: '' },
  ],
};

const delayConfig: NodeConfig = {
  type: 'delay',
  label: 'Delay',
  icon: 'Clock',
  category: 'logic',
  handles: [
    { type: 'target', position: 'left', id: 'input', label: 'Input', style: { top: '50%' } },
    { type: 'source', position: 'right', id: 'output', label: 'Output', style: { top: '50%' } },
  ],
  fields: [
    { name: 'ms', type: 'slider', label: 'Delay (ms)', defaultValue: 1000, min: 100, max: 10000 },
  ],
};

// ── Transform (need 3 more) ──────────────────────────────────
const jsonParserConfig: NodeConfig = {
  type: 'jsonParser',
  label: 'JSON Parser',
  icon: 'Braces',
  category: 'transform',
  handles: [
    { type: 'target', position: 'left', id: 'input', label: 'Input', style: { top: '50%' } },
    { type: 'source', position: 'right', id: 'output', label: 'Output', style: { top: '50%' } },
  ],
  fields: [
    { name: 'path', type: 'text', label: 'JSON Path', defaultValue: '$.data' },
  ],
};

const templateConfig: NodeConfig = {
  type: 'template',
  label: 'Template',
  icon: 'LayoutTemplate',
  category: 'transform',
  handles: [
    { type: 'target', position: 'left', id: 'input', label: 'Input', style: { top: '50%' } },
    { type: 'source', position: 'right', id: 'output', label: 'Output', style: { top: '50%' } },
  ],
  fields: [
    { name: 'template', type: 'textarea', label: 'Template', defaultValue: 'Hello, {{name}}!' },
  ],
};

const mapperConfig: NodeConfig = {
  type: 'mapper',
  label: 'Map',
  icon: 'ArrowRight',
  category: 'transform',
  handles: [
    { type: 'target', position: 'left', id: 'input', label: 'Input', style: { top: '50%' } },
    { type: 'source', position: 'right', id: 'output', label: 'Output', style: { top: '50%' } },
  ],
  fields: [
    { name: 'expression', type: 'text', label: 'Map Expression', defaultValue: 'item => item' },
  ],
};

// ── Integration (need 3 more) ────────────────────────────────
const webhookConfig: NodeConfig = {
  type: 'webhook',
  label: 'Webhook',
  icon: 'Webhook',
  category: 'integration',
  handles: [
    { type: 'source', position: 'right', id: 'output', label: 'Output', style: { top: '50%' } },
  ],
  fields: [
    { name: 'url', type: 'text', label: 'Endpoint URL', defaultValue: '/webhook' },
    { name: 'method', type: 'select', label: 'Method', options: [
      { value: 'POST', label: 'POST' },
      { value: 'GET', label: 'GET' },
    ], defaultValue: 'POST' },
  ],
};

const databaseConfig: NodeConfig = {
  type: 'database',
  label: 'Database',
  icon: 'Database',
  category: 'integration',
  handles: [
    { type: 'target', position: 'left', id: 'query', label: 'Query', style: { top: '50%' } },
    { type: 'source', position: 'right', id: 'result', label: 'Result', style: { top: '50%' } },
  ],
  fields: [
    { name: 'query', type: 'textarea', label: 'SQL Query', defaultValue: 'SELECT * FROM users' },
  ],
};

const emailConfig: NodeConfig = {
  type: 'email',
  label: 'Email',
  icon: 'Mail',
  category: 'integration',
  handles: [
    { type: 'target', position: 'left', id: 'body', label: 'Body', style: { top: '50%' } },
    { type: 'source', position: 'right', id: 'status', label: 'Status', style: { top: '50%' } },
  ],
  fields: [
    { name: 'to', type: 'text', label: 'To', defaultValue: '' },
    { name: 'subject', type: 'text', label: 'Subject', defaultValue: '' },
  ],
};

// ── Utility (need 3 more) ────────────────────────────────────
const loggerConfig: NodeConfig = {
  type: 'logger',
  label: 'Logger',
  icon: 'ScrollText',
  category: 'utility',
  handles: [
    { type: 'target', position: 'left', id: 'input', label: 'Input', style: { top: '50%' } },
    { type: 'source', position: 'right', id: 'passthrough', label: 'Pass', style: { top: '50%' } },
  ],
  fields: [
    { name: 'level', type: 'select', label: 'Level', options: [
      { value: 'info', label: 'Info' },
      { value: 'warn', label: 'Warning' },
      { value: 'error', label: 'Error' },
    ], defaultValue: 'info' },
  ],
};

const commentConfig: NodeConfig = {
  type: 'comment',
  label: 'Comment',
  icon: 'MessageCircle',
  category: 'utility',
  handles: [],
  fields: [
    { name: 'text', type: 'textarea', label: 'Comment', defaultValue: '' },
  ],
};

const debugConfig: NodeConfig = {
  type: 'debug',
  label: 'Debug',
  icon: 'Bug',
  category: 'utility',
  handles: [
    { type: 'target', position: 'left', id: 'input', label: 'Input', style: { top: '50%' } },
  ],
  fields: [
    { name: 'breakpoint', type: 'select', label: 'Mode', options: [
      { value: 'log', label: 'Log Output' },
      { value: 'pause', label: 'Pause Execution' },
    ], defaultValue: 'log' },
  ],
};

export const dummyConfigs: NodeConfig[] = [
  // General +2
  variableConfig, constantConfig,
  // LLM +4
  chatConfig, embeddingConfig, summarizerConfig, classifierConfig,
  // Logic +4
  switchConfig, loopConfig, filterConfig, delayConfig,
  // Transform +3
  jsonParserConfig, templateConfig, mapperConfig,
  // Integration +3
  webhookConfig, databaseConfig, emailConfig,
  // Utility +3
  loggerConfig, commentConfig, debugConfig,
];
