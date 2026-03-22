// theme.ts — Single source of truth for category styling

// Unified brand theme for all nodes and toolbar buttons (VectorShift-style single accent)
export const UNIFIED_NODE_THEME = {
  accent: '#2970ff',
  headerLight: 'bg-brand-50',
  headerDark: 'bg-brand-950/30',
  text: 'text-brand-700',
  textDark: 'text-brand-300',
  toolbar: 'border-secondary bg-transparent text-foreground hover:bg-background-secondary shadow-none',
  toolbarDark: 'border-secondary bg-transparent text-foreground hover:bg-background-secondary shadow-none',
} as const;

export interface CategoryTheme {
  accent: string;
  headerLight: string;
  headerDark: string;
  text: string;
  textDark: string;
  toolbar: string;
  toolbarDark: string;
}

export const CATEGORY_THEME: Record<string, CategoryTheme> = {
  general: {
    accent: '#3b82f6',
    headerLight: 'bg-blue-50',
    headerDark: 'bg-blue-950/30',
    text: 'text-blue-700',
    textDark: 'text-blue-300',
    toolbar: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-xs',
    toolbarDark: 'border-blue-800 bg-blue-950/40 text-blue-300 hover:bg-blue-900/50 shadow-xs',
  },
  llm: {
    accent: '#a855f7',
    headerLight: 'bg-purple-50',
    headerDark: 'bg-purple-950/30',
    text: 'text-purple-700',
    textDark: 'text-purple-300',
    toolbar: 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 shadow-xs',
    toolbarDark: 'border-purple-800 bg-purple-950/40 text-purple-300 hover:bg-purple-900/50 shadow-xs',
  },
  io: {
    accent: '#3b82f6',
    headerLight: 'bg-blue-50',
    headerDark: 'bg-blue-950/30',
    text: 'text-blue-700',
    textDark: 'text-blue-300',
    toolbar: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-xs',
    toolbarDark: 'border-blue-800 bg-blue-950/40 text-blue-300 hover:bg-blue-900/50 shadow-xs',
  },
  ai: {
    accent: '#a855f7',
    headerLight: 'bg-purple-50',
    headerDark: 'bg-purple-950/30',
    text: 'text-purple-700',
    textDark: 'text-purple-300',
    toolbar: 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 shadow-xs',
    toolbarDark: 'border-purple-800 bg-purple-950/40 text-purple-300 hover:bg-purple-900/50 shadow-xs',
  },
  transform: {
    accent: '#22c55e',
    headerLight: 'bg-green-50',
    headerDark: 'bg-green-950/30',
    text: 'text-green-700',
    textDark: 'text-green-300',
    toolbar: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100 shadow-xs',
    toolbarDark: 'border-green-800 bg-green-950/40 text-green-300 hover:bg-green-900/50 shadow-xs',
  },
  logic: {
    accent: '#f59e0b',
    headerLight: 'bg-amber-50',
    headerDark: 'bg-amber-950/30',
    text: 'text-amber-700',
    textDark: 'text-amber-300',
    toolbar: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 shadow-xs',
    toolbarDark: 'border-amber-800 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 shadow-xs',
  },
  integration: {
    accent: '#ef4444',
    headerLight: 'bg-red-50',
    headerDark: 'bg-red-950/30',
    text: 'text-red-700',
    textDark: 'text-red-300',
    toolbar: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 shadow-xs',
    toolbarDark: 'border-red-800 bg-red-950/40 text-red-300 hover:bg-red-900/50 shadow-xs',
  },
  utility: {
    accent: '#6b7280',
    headerLight: 'bg-gray-50',
    headerDark: 'bg-gray-800/30',
    text: 'text-gray-600',
    textDark: 'text-gray-300',
    toolbar: 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 shadow-xs',
    toolbarDark: 'border-gray-700 bg-gray-800/40 text-gray-300 hover:bg-gray-700/50 shadow-xs',
  },
} as const;
