import { FieldSpec, FieldOption } from '../types/nodeConfig';
import { TextField } from './fields/TextField';
import { SelectField } from './fields/SelectField';
import { TextAreaField } from './fields/TextAreaField';
import { SliderField } from './fields/SliderField';
import { VariableTextField } from './fields/VariableTextField';
import { SmartTextareaField } from './fields/SmartTextareaField';

interface BaseFieldProps {
  name: string;
  label: string;
  value: string | number;
  onChange: (name: string, value: string | number) => void;
  nodeId: string;
  options?: FieldOption[];
  min?: number;
  max?: number;
  step?: number;
}

type FieldComponent = React.FC<BaseFieldProps>;

const FIELD_COMPONENTS: Record<string, FieldComponent> = {
  text: TextField as FieldComponent,
  select: SelectField as FieldComponent,
  textarea: TextAreaField as FieldComponent,
  slider: SliderField as FieldComponent,
  variableText: VariableTextField as FieldComponent,
  smartTextarea: SmartTextareaField as FieldComponent,
};

interface FieldRendererProps {
  field: FieldSpec;
  value: string | number;
  onChange: (name: string, value: string | number) => void;
  nodeId: string;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange, nodeId }) => {
  const Component = FIELD_COMPONENTS[field.type];
  if (!Component) return null;

  return (
    <Component
      name={field.name}
      label={field.label}
      value={value}
      onChange={onChange}
      nodeId={nodeId}
      {...(field.options && { options: field.options })}
      {...(field.min !== undefined && { min: field.min })}
      {...(field.max !== undefined && { max: field.max })}
      {...(field.step !== undefined && { step: field.step })}
    />
  );
};
