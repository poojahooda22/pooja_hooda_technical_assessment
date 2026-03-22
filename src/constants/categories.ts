// Shared category order, labels, and accent colors — used by PipelineToolbar, AddNodeMenu, and BaseNode

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

// Accent color per category (hex) — used for dots, node headers, borders
export const CATEGORY_COLORS: Record<string, string> = {
  general: '#3b82f6',    // blue
  llm: '#a855f7',        // purple
  logic: '#f59e0b',      // amber
  transform: '#22c55e',  // green
  integration: '#ef4444', // red
  utility: '#6b7280',    // gray
};
