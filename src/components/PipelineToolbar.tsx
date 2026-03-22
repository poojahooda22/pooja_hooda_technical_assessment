// PipelineToolbar.tsx — VectorShift-inspired tabbed toolbar
// Row 1: Search + category tab labels
// Row 2: Node cards (icon + label) for selected category

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
import { DraggableNode } from './DraggableNode';
import { AnimatedThemeToggler } from './AnimatedThemeToggler';
import { nodeConfigs } from '../nodes/registry';
import { cn } from '../lib/utils';
import { CATEGORY_ORDER, CATEGORY_LABELS } from '../constants/categories';
import type { NodeConfig } from '../types/nodeConfig';

interface GroupedCategory {
  category: string;
  label: string;
  nodes: NodeConfig[];
}

export const PipelineToolbar = () => {
  const [query, setQuery] = useState('');

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

  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return nodeConfigs.filter((c) => {
      const categoryLabel = (CATEGORY_LABELS[c.category] || c.category).toLowerCase();
      return c.label.toLowerCase().includes(q) || categoryLabel.includes(q) || c.type.toLowerCase().includes(q);
    });
  }, [query]);

  return (
    <div className="bg-background shadow-xs">
      <Tabs type="button-white-border" defaultValue={CATEGORY_ORDER[0]}>
        {/* Tabs row: category triggers + search + theme toggle */}
        <div className="flex items-center gap-xl px-xl py-xs">
          <TabsList className="flex-1 min-w-0">
            {grouped.map((g) => (
              <TabsTrigger key={g.category} value={g.category}>
                {g.label}
              </TabsTrigger>
            ))}

            {/* Search — inside tab strip, after all triggers */}
            <div className="relative flex items-center ml-sm shrink-0" onClick={(e) => e.stopPropagation()}>
              <Search size={14} className="absolute left-md text-foreground-muted pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Nodes"
                className={cn(
                  'h-7 pl-7xl pr-xl text-[11px] font-medium rounded-md border border-secondary bg-background-secondary',
                  'placeholder:text-foreground-placeholder',
                  'focus:shadow-focus-ring-brand-xs focus:outline-none focus:border-brand',
                  'transition-all duration-200 w-[150px] focus:w-[180px]'
                )}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-xs p-xxs rounded-sm text-foreground-muted hover:text-foreground cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </TabsList>

          {/* Theme toggle — right end */}
          <AnimatedThemeToggler className="shrink-0" />
        </div>

        {/* Row 2: Node cards for selected category (or search results) */}
        <div className="px-xl py-sm overflow-x-auto">
          {searchResults ? (
            <div className="flex items-center gap-lg">
              {searchResults.length > 0 ? (
                searchResults.map((config) => (
                  <DraggableNode
                    key={config.type}
                    type={config.type}
                    label={config.label}
                    icon={config.icon}
                    category={config.category}
                  />
                ))
              ) : (
                <span className="text-xs text-foreground-muted py-md">No nodes found</span>
              )}
            </div>
          ) : (
            grouped.map((g) => (
              <TabsContent
                key={g.category}
                value={g.category}
                className="!mt-0 data-[state=inactive]:hidden"
              >
                <div className="flex items-start gap-lg">
                  {g.nodes.map((config) => (
                    <DraggableNode
                      key={config.type}
                      type={config.type}
                      label={config.label}
                      icon={config.icon}
                      category={config.category}
                    />
                  ))}
                </div>
              </TabsContent>
            ))
          )}
        </div>
      </Tabs>
    </div>
  );
};
