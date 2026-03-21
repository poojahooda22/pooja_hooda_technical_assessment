// SmartTextareaField — Multi-line textarea with {{ }} node reference dropdown

import { useState, useRef, useCallback, useEffect } from 'react';
import { useNodeDropdown } from '../../hooks/useNodeDropdown';
import { NodeDropdown } from '../../components/NodeDropdown';
import { VariableBadgeBar } from './VariableBadgeBar';
import { extractVariables } from '../../utils/templateParser';

interface DropdownNode {
  nodeId: string;
  name: string;
  label: string;
}

interface SmartTextareaFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
  nodeId: string;
}

const VAR_PATTERN = /\{\{\s*[a-zA-Z_$][a-zA-Z0-9_$.:-]*\s*\}\}/g;

const splitValue = (raw: string): { vars: string[]; freeText: string } => {
  const vars = extractVariables(raw);
  const freeText = raw.replace(VAR_PATTERN, '').replace(/\s{2,}/g, ' ').trim();
  return { vars, freeText };
};

const combineValue = (vars: string[], freeText: string): string => {
  const varParts = vars.map((v) => `{{${v}}}`);
  const parts = [...varParts, freeText].filter(Boolean);
  return parts.join(' ').trim();
};

const MIN_HEIGHT = 40;
const MAX_HEIGHT = 140;

export const SmartTextareaField: React.FC<SmartTextareaFieldProps> = ({ name, label, value, onChange, nodeId }) => {
  const [vars, setVars] = useState<string[]>(() => splitValue(value || '').vars);
  const [freeText, setFreeText] = useState<string>(() => splitValue(value || '').freeText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const scrollH = el.scrollHeight;
    if (scrollH <= MAX_HEIGHT) {
      el.style.height = `${Math.max(MIN_HEIGHT, scrollH)}px`;
      el.style.overflowY = 'hidden';
    } else {
      el.style.height = `${MAX_HEIGHT}px`;
      el.style.overflowY = 'auto';
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [freeText, adjustHeight]);

  const syncToStore = useCallback(
    (newVars: string[], newFreeText: string) => {
      const combined = combineValue(newVars, newFreeText);
      onChange(name, combined);
    },
    [name, onChange]
  );

  const {
    showDropdown,
    filteredNodes,
    selectedIndex,
    setSelectedIndex,
    dropdownRef,
    checkTrigger,
    closeDropdown,
    handleKeyDown: dropdownKeyDown,
  } = useNodeDropdown(nodeId, textareaRef);

  const handleSelect = useCallback(
    (node: DropdownNode) => {
      const newVars = vars.includes(node.name) ? vars : [...vars, node.name];
      const cleaned = freeText.replace(/\{\{[^}]*$/, '').trim();
      setVars(newVars);
      setFreeText(cleaned);
      syncToStore(newVars, cleaned);
      closeDropdown();
    },
    [vars, freeText, syncToStore, closeDropdown]
  );

  const handleRemoveVar = useCallback(
    (varName: string) => {
      const newVars = vars.filter((v) => v !== varName);
      setVars(newVars);
      syncToStore(newVars, freeText);
    },
    [vars, freeText, syncToStore]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      setFreeText(text);
      const combined = combineValue(vars, text);
      const varsLength = vars.map((v) => `{{${v}}}`).join(' ').length;
      const offset = varsLength > 0 ? varsLength + 1 : 0;
      checkTrigger(combined, offset + e.target.selectionStart);
      syncToStore(vars, text);
    },
    [vars, checkTrigger, syncToStore]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => dropdownKeyDown(e, handleSelect),
    [dropdownKeyDown, handleSelect]
  );

  useEffect(() => {
    if (value !== undefined) {
      const { vars: newVars, freeText: newFree } = splitValue(value);
      setVars(newVars);
      setFreeText(newFree);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const hasVars = vars.length > 0;
  const rawValue = combineValue(vars, freeText);

  return (
    <label className="flex flex-col gap-1 relative">
      <span className="text-xxs font-medium text-foreground-secondary">{label}</span>
      <div className="bg-background-secondary border border-secondary rounded-md shadow-xs
                      focus-within:border-brand focus-within:shadow-focus-ring-brand-xs
                      transition-[border-color,box-shadow] duration-200">
        <VariableBadgeBar value={rawValue} onRemove={handleRemoveVar} />
        <textarea
          ref={textareaRef}
          value={freeText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={hasVars ? 1 : 2}
          className="nodrag nowheel scrollbar-thin w-full px-xl py-md text-[8px] bg-transparent
                     text-foreground focus:outline-none
                     resize-none placeholder:text-foreground-placeholder border-none"
          placeholder={hasVars ? '' : 'Enter text or use {{ to reference nodes'}
        />
      </div>

      {showDropdown && (
        <NodeDropdown
          dropdownRef={dropdownRef}
          filteredNodes={filteredNodes}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          onSelect={handleSelect}
        />
      )}
    </label>
  );
};
