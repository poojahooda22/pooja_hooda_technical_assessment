/**
 * Reusable dropdown UI for selecting canvas nodes.
 * Used by VariableTextField and TextNodeContent when user types `{{`.
 */
import React from 'react';

interface DropdownNode {
  nodeId: string;
  name: string;
  label: string;
}

interface NodeDropdownProps {
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  filteredNodes: DropdownNode[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  onSelect: (node: DropdownNode) => void;
}

export const NodeDropdown = ({
  dropdownRef,
  filteredNodes,
  selectedIndex,
  setSelectedIndex,
  onSelect,
}: NodeDropdownProps) => (
  <div
    ref={dropdownRef}
    className="nodrag nowheel nopan absolute left-0 right-0 top-full mt-1 bg-background border border-secondary
               rounded-lg shadow-md z-50 max-h-48 overflow-y-auto scrollbar-thin
               animate-dropdown-grow origin-top"
  >
    <div className="px-2.5 py-1.5 text-[10px] text-foreground-muted font-semibold uppercase tracking-wide border-b border-tertiary">
      Nodes
    </div>

    {filteredNodes.length > 0 ? (
      filteredNodes.map((node, idx) => (
        <div
          key={node.nodeId}
          className={`nodrag nopan px-2.5 py-1.5 text-sm cursor-pointer flex items-center justify-between gap-2
                      ${idx === selectedIndex
                        ? 'bg-background-brand text-foreground-brand'
                        : 'hover:bg-background-secondary-hover text-foreground'}`}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(node);
          }}
          onMouseEnter={() => setSelectedIndex(idx)}
        >
          <span className="truncate">{node.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-background-tertiary text-foreground-muted font-medium shrink-0">
            {node.label}
          </span>
        </div>
      ))
    ) : (
      <div className="px-2.5 py-2 text-xs text-foreground-muted">No matching nodes</div>
    )}
  </div>
);
