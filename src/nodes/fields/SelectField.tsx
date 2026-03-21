import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { FieldOption } from '../../types/nodeConfig';

interface SelectFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
  options?: FieldOption[];
  nodeId?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({ name, label, value, onChange, options = [] }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label || value;

  const handleSelect = useCallback(
    (optValue: string) => {
      onChange(name, optValue);
      setOpen(false);
    },
    [name, onChange]
  );

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xxs text-foreground-secondary font-medium">{label}</span>
      <div ref={containerRef} className="relative nodrag nowheel">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between px-xl py-md text-[8px] bg-background-secondary
                     border border-secondary rounded-md shadow-xs text-foreground cursor-pointer
                     focus:outline-none focus:border-brand focus:shadow-focus-ring-brand-xs
                     transition-[border-color,box-shadow] duration-200 text-left"
        >
          <span>{selectedLabel}</span>
          <ChevronDown
            size={12}
            className={cn('text-fg-muted transition-transform duration-200', open && 'rotate-180')}
          />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50
                          bg-background border border-secondary rounded-md shadow-md
                          animate-dropdown-grow origin-top max-h-40 overflow-y-auto">
            {options.map((opt) => (
              <div
                key={opt.value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(opt.value);
                }}
                className={cn(
                  'px-xl py-md text-[8px] cursor-pointer transition-colors',
                  opt.value === value
                    ? 'bg-background-brand text-foreground-brand font-medium'
                    : 'text-foreground hover:bg-background-secondary-hover'
                )}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </label>
  );
};
