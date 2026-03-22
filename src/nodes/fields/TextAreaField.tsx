import { useRef, useEffect, useCallback } from 'react';

interface TextAreaFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
  nodeId?: string;
}

const MIN_HEIGHT = 40;  // Default collapsed height (~2 lines)
const MAX_HEIGHT = 140; // Auto-expand up to this, then scroll

export const TextAreaField: React.FC<TextAreaFieldProps> = ({ name, label, value, onChange }) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // Reset to auto so scrollHeight reflects true content height
    el.style.height = 'auto';
    const scrollH = el.scrollHeight;
    if (scrollH <= MAX_HEIGHT) {
      // Content fits — expand to fit, no scrollbar
      el.style.height = `${Math.max(MIN_HEIGHT, scrollH)}px`;
      el.style.overflowY = 'hidden';
    } else {
      // Content exceeds max — cap height, show scrollbar
      el.style.height = `${MAX_HEIGHT}px`;
      el.style.overflowY = 'auto';
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xxs text-foreground-secondary font-medium">{label}</span>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        rows={2}
        className="nodrag nowheel scrollbar-thin w-full px-xl py-md text-[8px] bg-background-alt border border-primary rounded-md
                   focus:outline-none focus:border-brand focus:shadow-focus-ring-brand-xs
                   transition-[border-color,box-shadow] duration-200
                   resize-none text-foreground placeholder:text-foreground-placeholder"
      />
    </label>
  );
};
