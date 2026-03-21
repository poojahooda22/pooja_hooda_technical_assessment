import * as SliderPrimitive from '@radix-ui/react-slider';

interface SliderFieldProps {
  name: string;
  label: string;
  value: number;
  onChange: (name: string, value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  nodeId?: string;
}

export const SliderField: React.FC<SliderFieldProps> = ({ name, label, value, onChange, min = 0, max = 100, step = 1 }) => (
  <label className="flex flex-col gap-1">
    <span className="text-xs text-foreground-secondary font-medium">
      {label}: <span className="text-foreground font-semibold">{value}</span>
    </span>
    <SliderPrimitive.Root
      className="nodrag relative flex items-center w-full touch-none select-none py-2"
      value={[value]}
      onValueChange={([v]) => onChange(name, v)}
      min={min}
      max={max}
      step={step}
    >
      <SliderPrimitive.Track className="relative grow h-1.5 rounded-xs bg-border-secondary overflow-hidden">
        <SliderPrimitive.Range className="absolute h-full rounded-xs bg-background-brand-solid" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className="block size-4 rounded-full bg-white border-2 border-brand-solid shadow-md
                   cursor-grab active:cursor-grabbing
                   focus-visible:outline-none focus-visible:shadow-focus-ring-brand-xs
                   hover:border-brand-solid-alt
                   active:scale-110 motion-reduce:active:scale-100
                   transition-[shadow,transform] duration-150"
      />
    </SliderPrimitive.Root>
  </label>
);
