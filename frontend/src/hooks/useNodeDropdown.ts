import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useStore } from '../store';
import { shallow } from 'zustand/shallow';
import { nodeConfigs } from '../nodes/registry';
import type { Node } from 'reactflow';
import type { NodeData, StoreState } from '../types/store';

export interface DropdownNode {
  nodeId: string;
  name: string;
  label: string;
}

interface TriggerResult {
  triggerIndex: number;
  query: string;
}

export interface UseNodeDropdownReturn {
  showDropdown: boolean;
  filteredNodes: DropdownNode[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  checkTrigger: (text: string, cursorPos: number) => void;
  insertReference: (currentText: string, node: DropdownNode) => string;
  handleKeyDown: (e: React.KeyboardEvent, onSelect: (node: DropdownNode) => void) => void;
}

// Resolve a human-readable name for any node
const getNodeDisplayName = (node: Node<NodeData>): string =>
  (node.data?.inputName as string) || (node.data?.outputName as string) || (node.data?.name as string) || node.id;

// Derive label from node type via registry (no circular dependency)
const getNodeLabel = (type: string | undefined): string =>
  nodeConfigs.find((c) => c.type === type)?.label || type || '';

/**
 * Detects an unclosed `{{` before the cursor position.
 * Returns { triggerIndex, query } or null.
 */
const detectTrigger = (text: string, cursorPos: number): TriggerResult | null => {
  const before = text.slice(0, cursorPos);
  const lastOpen = before.lastIndexOf('{{');
  if (lastOpen === -1) return null;

  const between = before.slice(lastOpen + 2);
  if (between.includes('}}')) return null;

  return { triggerIndex: lastOpen, query: between };
};

/**
 * Reusable hook for the `{{` triggered node-reference dropdown.
 * Works with any textarea that supports `{{nodeName}}` references.
 *
 * @param nodeId - The current node's ID (to exclude from dropdown)
 * @param textareaRef - Ref to the textarea element
 */
export const useNodeDropdown = (
  nodeId: string,
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
): UseNodeDropdownReturn => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [dropdownQuery, setDropdownQuery] = useState<string>('');
  const [triggerIndex, setTriggerIndex] = useState<number>(0);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Narrow selector: only extract IDs, types, and display-relevant data.
  // Uses shallow comparison so components only re-render when node identity/names change,
  // not on every position or unrelated data update.
  const availableNodes = useStore(
    useCallback(
      (s: StoreState): DropdownNode[] =>
        s.nodes
          .filter((n) => n.id !== nodeId)
          .map((n) => ({
            nodeId: n.id,
            name: getNodeDisplayName(n as Node<NodeData>),
            label: getNodeLabel(n.type),
          })),
      [nodeId]
    ),
    shallow
  );

  // Filtered by the query typed after `{{`
  const filteredNodes = useMemo<DropdownNode[]>(() => {
    if (!dropdownQuery) return availableNodes;
    const q = dropdownQuery.toLowerCase();
    return availableNodes.filter((n) => n.name.toLowerCase().includes(q));
  }, [availableNodes, dropdownQuery]);

  // Reset selection when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredNodes.length]);

  // Detect trigger from text + cursor position (call from onChange)
  const checkTrigger = useCallback((text: string, cursorPos: number): void => {
    const trigger = detectTrigger(text, cursorPos);
    if (trigger) {
      setShowDropdown(true);
      setDropdownQuery(trigger.query);
      setTriggerIndex(trigger.triggerIndex);
    } else {
      setShowDropdown(false);
    }
  }, []);

  // Insert selected node reference into text, returns new text value
  const insertReference = useCallback(
    (currentText: string, node: DropdownNode): string => {
      const before = currentText.slice(0, triggerIndex);
      const cursorPos = textareaRef.current?.selectionStart ?? currentText.length;
      const after = currentText.slice(cursorPos);
      const reference = `{{${node.name}}}`;
      const newValue = before + reference + after;

      setShowDropdown(false);

      // Restore focus and cursor after the inserted reference
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          const newPos = before.length + reference.length;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      });

      return newValue;
    },
    [triggerIndex, textareaRef]
  );

  // Keyboard handler (call from onKeyDown, pass handleSelect callback)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, onSelect: (node: DropdownNode) => void): void => {
      if (!showDropdown) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredNodes.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (filteredNodes[selectedIndex]) {
          onSelect(filteredNodes[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setShowDropdown(false);
      }
    },
    [showDropdown, filteredNodes, selectedIndex]
  );

  // Close dropdown on click outside
  useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (e: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as HTMLElement) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as HTMLElement)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown, textareaRef]);

  return {
    showDropdown,
    filteredNodes,
    selectedIndex,
    setSelectedIndex,
    dropdownRef,
    checkTrigger,
    insertReference,
    handleKeyDown,
  };
};
