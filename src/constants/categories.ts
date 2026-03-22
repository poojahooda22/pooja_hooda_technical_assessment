// Shared category order and display labels — used by PipelineToolbar and AddNodeMenu

export const CATEGORY_ORDER: string[] = [
  'general',
  'llm',
  'logic',
  'transform',
  'integration',
  'utility',
];

export const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  llm: 'LLMs',
  logic: 'Logic',
  transform: 'Data Transform',
  integration: 'Integration',
  utility: 'Utility',
};
