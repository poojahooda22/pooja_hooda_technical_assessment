interface TextFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
  nodeId?: string;
}

export const TextField: React.FC<TextFieldProps> = ({ name, label, value, onChange }) => (
  <label className="flex flex-col gap-1">
    <span className="text-xxs text-foreground-secondary font-medium">{label}</span>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      className="w-full px-xl py-md text-[8px] bg-background-alt border border-primary rounded-md
                 focus:outline-none focus:border-brand focus:shadow-focus-ring-brand-xs
                 transition-[border-color,box-shadow] duration-200
                 text-foreground placeholder:text-foreground-placeholder"
    />
  </label>
);
