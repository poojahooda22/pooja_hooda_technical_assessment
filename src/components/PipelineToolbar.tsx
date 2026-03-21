// PipelineToolbar.tsx — Auto-generated from node registry, grouped by category

import { useState, useEffect, useMemo } from 'react';
import { Sun, Moon } from 'lucide-react';
import { DraggableNode } from './DraggableNode';
import { nodeConfigs } from '../nodes/registry';
import type { NodeConfig } from '../types/nodeConfig';

const CATEGORY_ORDER: string[] = ['general', 'llm', 'logic', 'transform', 'integration', 'utility'];
const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  llm: 'LLMs',
  logic: 'Logic',
  transform: 'Data Transform',
  integration: 'Integration',
  utility: 'Utility',
};

interface GroupedCategory {
  category: string;
  label: string;
  nodes: NodeConfig[];
}

export const PipelineToolbar = () => {
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = (): void => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  const grouped = useMemo<GroupedCategory[]>(() =>
    CATEGORY_ORDER
      .map((cat) => ({
        category: cat,
        label: CATEGORY_LABELS[cat] || cat,
        nodes: nodeConfigs.filter((c) => c.category === cat),
      }))
      .filter((g) => g.nodes.length > 0),
    []
  );

  return (
    <div className="px-xl py-lg bg-background border-b border-secondary flex items-center shadow-xs">
      <div className="flex flex-wrap items-center gap-x-5xl gap-y-md">
        {grouped.map((group) => (
          <div key={group.category} className="flex items-center gap-md">
            {group.nodes.map((config) => (
              <DraggableNode
                key={config.type}
                type={config.type}
                label={config.label}
                icon={config.icon}
                category={config.category}
              />
            ))}
          </div>
        ))}
      </div>
      <button onClick={toggleTheme} className="ml-auto inline-flex items-center justify-center size-9
                   rounded-xl bg-transparent text-foreground-tertiary
                   hover:bg-background-secondary-hover hover:text-foreground
                   transition-all duration-200 cursor-pointer
                   focus-visible:shadow-focus-ring-brand-xs focus-visible:outline-none">
        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
      </button>
    </div>
  );
};
