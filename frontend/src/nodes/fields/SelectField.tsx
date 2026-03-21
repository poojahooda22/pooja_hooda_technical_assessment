import { ChevronDown } from 'lucide-react';
import { FieldOption } from '../../types/nodeConfig';

interface SelectFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
  options?: FieldOption[];
  nodeId?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({ name, label, value, onChange, options = [] }) => (
  <label className="flex flex-col gap-1">
    <span className="text-xxs text-foreground-secondary font-medium">{label}</span>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full px-xl py-md pr-8 text-[8px] bg-background-secondary border border-secondary rounded-md shadow-xs
                   focus:outline-none focus:border-brand focus:shadow-focus-ring-brand-xs
                   transition-[border-color,box-shadow] duration-200
                   text-foreground appearance-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-fg-muted"
      />
    </div>
  </label>
);
