import type { NodeConfig, FieldOption } from '../../types/nodeConfig';

export const LLM_MODELS: FieldOption[] = [
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
  { value: 'gemini-pro', label: 'Gemini Pro' },
];

const config: NodeConfig = {
  type: 'llm',
  label: 'LLM',
  icon: 'Brain',
  category: 'llm',
  handles: [
    { type: 'target', position: 'left', id: 'system', label: 'System', style: { top: 'calc(50% - 20px)' } },
    { type: 'target', position: 'left', id: 'prompt', label: 'Prompt', style: { top: 'calc(50% + 20px)' } },
    { type: 'source', position: 'right', id: 'response', label: 'Response', style: { top: '50%' } },
  ],
  fields: [
    { name: 'llmName', type: 'text', label: 'Name', defaultValue: (id: string) => id.replace('llm-', 'llm_') },
    { name: 'system', type: 'textarea', label: 'System (Instructions)' },
    { name: 'prompt', type: 'smartTextarea', label: 'Prompt' },
    { name: 'model', type: 'select', label: 'Model', options: LLM_MODELS },
  ],
};

export default config;
