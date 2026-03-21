import { X } from 'lucide-react';
import { extractVariables } from '../../utils/templateParser';

interface VariableBadgeBarProps {
  value: string;
  onRemove: (varName: string) => void;
}

export const VariableBadgeBar: React.FC<VariableBadgeBarProps> = ({ value, onRemove }) => {
  const variables = extractVariables(value);
  if (variables.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 nodrag nowheel px-xl pt-md">
      {variables.map((varName) => (
        <span
          key={varName}
          className="inline-flex items-center gap-xxs pl-md pr-xs py-xxs text-[10px] font-medium
                     border border-brand-200 rounded-sm bg-brand-50 text-brand-700"
        >
          {varName}
          <button
            type="button"
            className="flex items-center justify-center shrink-0 rounded-xxs text-brand-400
                       cursor-pointer border-none bg-transparent
                       hover:text-brand-700 hover:bg-brand-100
                       active:scale-90 p-xxs"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(varName);
            }}
            aria-label={`Remove ${varName}`}
          >
            <X size={10} />
          </button>
        </span>
      ))}
    </div>
  );
};
