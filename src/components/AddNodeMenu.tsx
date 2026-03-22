// AddNodeMenu.tsx — Blender-style Shift+A cascading "Add Node" menu
// Opens at cursor position, shows categories with flyout submenus
// Search bar is inactive by default; clicking it opens a dedicated search panel

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Search, ChevronRight, Clock, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { nodeConfigs } from '../nodes/registry';
import { CATEGORY_ORDER, CATEGORY_LABELS } from '../constants/categories';
import { cn } from '../lib/utils';

const MENU_WIDTH = 220;
const SUBMENU_WIDTH = 200;
const EDGE_PAD = 8;
const MAX_RECENT = 8;

interface AddNodeMenuProps {
  isOpen: boolean;
  screenPosition: { x: number; y: number };
  onClose: () => void;
  onAddNode: (type: string) => void;
}

// Group nodes by category (stable — nodeConfigs never changes)
const groupedByCategory = CATEGORY_ORDER
  .map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat] || cat,
    nodes: nodeConfigs.filter((c) => c.category === cat),
  }))
  .filter((g) => g.nodes.length > 0);

// Icon lookup helper
const getIcon = (iconName: string) =>
  (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[iconName] || null;

// Persist recent searches across menu open/close
let recentSearches: string[] = [];

export const AddNodeMenu = ({ isOpen, screenPosition, onClose, onAddNode }: AddNodeMenuProps) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [submenuPos, setSubmenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [searchActive, setSearchActive] = useState(false);
  const [query, setQuery] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoryRowRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Reset state when menu opens/closes
  useEffect(() => {
    if (isOpen) {
      setHoveredCategory(null);
      setSearchActive(false);
      setQuery('');
    }
  }, [isOpen]);

  // Focus search input when search panel activates
  useEffect(() => {
    if (searchActive) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [searchActive]);

  // Click-outside detection
  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (submenuRef.current?.contains(target)) return;
      if (searchPanelRef.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [isOpen, onClose]);

  // Search filtering
  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return nodeConfigs.filter((c) => {
      const categoryLabel = (CATEGORY_LABELS[c.category] || c.category).toLowerCase();
      return c.label.toLowerCase().includes(q) || categoryLabel.includes(q) || c.type.toLowerCase().includes(q);
    });
  }, [query]);

  // Compute clamped menu position
  const menuStyle = useMemo(() => {
    const x = Math.max(EDGE_PAD, Math.min(screenPosition.x, window.innerWidth - MENU_WIDTH - EDGE_PAD));
    const y = Math.max(EDGE_PAD, Math.min(screenPosition.y, window.innerHeight - 300 - EDGE_PAD));
    return { left: x, top: y } as const;
  }, [screenPosition]);

  // Category hover → compute submenu position
  const handleCategoryHover = useCallback((category: string) => {
    setHoveredCategory(category);
    const rowEl = categoryRowRefs.current.get(category);
    if (!rowEl) return;
    const rect = rowEl.getBoundingClientRect();
    const menuEl = menuRef.current;
    const menuRect = menuEl?.getBoundingClientRect();

    let left = rect.right + 4;
    if (left + SUBMENU_WIDTH > window.innerWidth - EDGE_PAD) {
      left = (menuRect?.left ?? rect.left) - SUBMENU_WIDTH - 4;
    }
    let top = rect.top;
    if (top + 200 > window.innerHeight - EDGE_PAD) {
      top = window.innerHeight - 200 - EDGE_PAD;
    }
    setSubmenuPos({ top, left });
  }, []);

  const addRecentSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    recentSearches = [trimmed, ...recentSearches.filter((s) => s !== trimmed)].slice(0, MAX_RECENT);
  }, []);

  const handleNodeClick = useCallback((type: string) => {
    if (query.trim()) addRecentSearch(query.trim());
    onAddNode(type);
  }, [onAddNode, query, addRecentSearch]);

  const handleRecentClick = useCallback((term: string) => {
    setQuery(term);
  }, []);

  const clearRecent = useCallback(() => {
    recentSearches = [];
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      if (searchActive) {
        setSearchActive(false);
        setQuery('');
      } else {
        onClose();
      }
    }
  }, [onClose, searchActive]);

  if (!isOpen) return null;

  const nodesForCategory = hoveredCategory
    ? nodeConfigs.filter((c) => c.category === hoveredCategory)
    : [];

  // Search panel (separate overlay when search is active)
  if (searchActive) {
    return (
      <div
        ref={searchPanelRef}
        className={cn(
          'fixed z-50 rounded-lg border border-secondary bg-background shadow-lg',
          'animate-dropdown-grow origin-top-left'
        )}
        style={{ ...menuStyle, width: MENU_WIDTH + 40 }}
        onKeyDown={handleKeyDown}
      >
        {/* Active search input */}
        <div className="px-2 pt-2 pb-1">
          <div className="relative flex items-center">
            <Search size={13} className="absolute left-2 text-foreground-muted pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search nodes..."
              className={cn(
                'h-7 w-full pl-7 pr-7 text-xs rounded-md border border-brand bg-background-secondary',
                'placeholder:text-foreground-placeholder',
                'shadow-focus-ring-brand-xs outline-none',
                'transition-[border-color,box-shadow] duration-200'
              )}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2 text-foreground-muted hover:text-foreground cursor-pointer"
              >
                <X size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Search results or recent searches */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin pb-1">
          {searchResults ? (
            searchResults.length > 0 ? (
              searchResults.map((config) => {
                const Icon = getIcon(config.icon);
                return (
                  <button
                    key={config.type}
                    onClick={() => handleNodeClick(config.type)}
                    className={cn(
                      'flex items-center gap-2 w-full px-3 py-1.5 text-xs text-foreground',
                      'cursor-pointer hover:bg-background-secondary-hover transition-colors duration-150'
                    )}
                  >
                    {Icon && <Icon size={13} className="text-foreground-secondary shrink-0" />}
                    <span>{config.label}</span>
                    <span className="ml-auto text-[10px] text-foreground-muted">
                      {CATEGORY_LABELS[config.category] || config.category}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-xs text-foreground-muted">No nodes found</div>
            )
          ) : (
            // Recent searches (default when no query)
            <>
              {recentSearches.length > 0 ? (
                <>
                  <div className="flex items-center justify-between px-3 pt-1 pb-1">
                    <span className="text-[10px] font-medium text-foreground-muted uppercase tracking-wider">Recent</span>
                    <button
                      onClick={clearRecent}
                      className="text-[10px] text-foreground-muted hover:text-foreground cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleRecentClick(term)}
                      className={cn(
                        'flex items-center gap-2 w-full px-3 py-1.5 text-xs text-foreground',
                        'cursor-pointer hover:bg-background-secondary-hover transition-colors duration-150'
                      )}
                    >
                      <Clock size={11} className="text-foreground-muted shrink-0" />
                      <span>{term}</span>
                    </button>
                  ))}
                </>
              ) : (
                <div className="px-3 py-3 text-xs text-foreground-muted text-center">
                  Type to search nodes...
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Default state: category menu with inactive search bar
  return (
    <>
      {/* Main menu panel */}
      <div
        ref={menuRef}
        className={cn(
          'fixed z-50 rounded-lg border border-secondary bg-background shadow-lg',
          'animate-dropdown-grow origin-top-left'
        )}
        style={{ ...menuStyle, width: MENU_WIDTH }}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="px-3 pt-2 pb-1.5 text-[11px] font-semibold text-foreground-secondary uppercase tracking-wider">
          Add
        </div>

        {/* Inactive search bar — click to activate */}
        <div className="px-2 pb-2">
          <div
            onClick={() => setSearchActive(true)}
            className={cn(
              'flex items-center gap-2 h-7 px-2 rounded-md border border-secondary bg-background-secondary',
              'cursor-pointer hover:border-foreground-muted transition-[border-color] duration-200'
            )}
          >
            <Search size={13} className="text-foreground-muted" />
            <span className="text-xs text-foreground-placeholder">Search...</span>
          </div>
        </div>

        {/* Category list */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin pb-1">
          {groupedByCategory.map((group) => (
            <div
              key={group.category}
              ref={(el) => {
                if (el) categoryRowRefs.current.set(group.category, el);
              }}
              onMouseEnter={() => handleCategoryHover(group.category)}
              onClick={() => handleCategoryHover(group.category)}
              className={cn(
                'flex items-center justify-between px-3 py-1.5 text-xs cursor-pointer',
                'transition-colors duration-150',
                hoveredCategory === group.category
                  ? 'bg-background-secondary-hover text-foreground'
                  : 'text-foreground hover:bg-background-secondary-hover'
              )}
            >
              <span>{group.label}</span>
              <ChevronRight size={12} className="text-foreground-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Cascading submenu */}
      {hoveredCategory && nodesForCategory.length > 0 && (
        <div
          ref={submenuRef}
          onMouseLeave={() => setHoveredCategory(null)}
          className={cn(
            'fixed z-50 rounded-lg border border-secondary bg-background shadow-lg',
            'animate-dropdown-grow origin-top-left'
          )}
          style={{ top: submenuPos.top, left: submenuPos.left, width: SUBMENU_WIDTH }}
        >
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin py-1">
            {nodesForCategory.map((config) => {
              const Icon = getIcon(config.icon);
              return (
                <button
                  key={config.type}
                  onClick={() => handleNodeClick(config.type)}
                  className={cn(
                    'flex items-center gap-2 w-full px-3 py-1.5 text-xs text-foreground',
                    'cursor-pointer hover:bg-background-secondary-hover transition-colors duration-150'
                  )}
                >
                  {Icon && <Icon size={13} className="text-foreground-secondary shrink-0" />}
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
