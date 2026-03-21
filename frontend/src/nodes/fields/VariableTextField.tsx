import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useNodeDropdown } from '../../hooks/useNodeDropdown';
import { NodeDropdown } from '../../components/NodeDropdown';
import { VariableBadgeBar } from './VariableBadgeBar';
import { removeVariable, extractVariables } from '../../utils/templateParser';

// Strip {{varName}} patterns from display text — variables show only as chips
const VAR_DISPLAY_REGEX = /\{\{\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*\}\}/g;
const stripVariables = (text: string): string =>
  text.replace(VAR_DISPLAY_REGEX, '').replace(/\s{2,}/g, ' ').trim();

interface DropdownNode {
  nodeId: string;
  name: string;
  label: string;
}

interface VariableTextFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
  nodeId: string;
}

const MIN_HEIGHT = 40;
const MAX_HEIGHT = 140;

export const VariableTextField: React.FC<VariableTextFieldProps> = ({ name, label, value, onChange, nodeId }) => {
  const [localValue, setLocalValue] = useState<string>(value || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-size: expand with content up to MAX_HEIGHT, then scroll
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
  }, [localValue, adjustHeight]);

  const {
    showDropdown,
    filteredNodes,
    selectedIndex,
    setSelectedIndex,
    dropdownRef,
    checkTrigger,
    insertReference,
    handleKeyDown: dropdownKeyDown,
  } = useNodeDropdown(nodeId, textareaRef);

  const handleSelect = useCallback(
    (node: DropdownNode) => {
      const newValue = insertReference(localValue, node);
      setLocalValue(newValue);
      onChange(name, newValue);
    },
    [localValue, insertReference, name, onChange]
  );

  const handleRemoveVar = useCallback(
    (varName: string) => {
      const newValue = removeVariable(localValue, varName);
      setLocalValue(newValue);
      onChange(name, newValue);
    },
    [localValue, name, onChange]
  );

  // Display value strips {{var}} — those only show as chips
  const displayValue = useMemo(() => stripVariables(localValue), [localValue]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const typed = e.target.value;
      // Reconstruct raw value: keep existing {{vars}} from localValue, replace the plain-text portion
      const existingVars = localValue.match(VAR_DISPLAY_REGEX) || [];
      const newRaw = existingVars.join(' ') + (typed ? ' ' + typed : '');
      const cleaned = newRaw.replace(/\s{2,}/g, ' ').trim();
      setLocalValue(cleaned);
      onChange(name, cleaned);
      checkTrigger(cleaned, cleaned.length);
    },
    [localValue, name, onChange, checkTrigger]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => dropdownKeyDown(e, handleSelect),
    [dropdownKeyDown, handleSelect]
  );

  useEffect(() => {
    if (value !== undefined && value !== localValue) {
      setLocalValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <label className="flex flex-col gap-1 relative">
      <span className="text-xs font-medium text-foreground-secondary">{label}</span>
      <div className="bg-background-secondary border border-secondary rounded-md shadow-xs
                      focus-within:border-brand focus-within:shadow-focus-ring-brand-xs
                      transition-[border-color,box-shadow] duration-200">
        <VariableBadgeBar value={localValue} onRemove={handleRemoveVar} />
        <textarea
          ref={textareaRef}
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={2}
          className="nodrag nowheel scrollbar-thin w-full px-xl py-md text-sm bg-transparent
                     text-foreground focus:outline-none
                     resize-none placeholder:text-foreground-placeholder border-none"
          placeholder={extractVariables(localValue).length > 0 ? '' : 'Type {{ to reference nodes'}
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
