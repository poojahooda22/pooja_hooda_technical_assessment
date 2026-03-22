import type { NodeConfig } from '../../types/nodeConfig';

const config: NodeConfig = {
  type: 'conditional',
  label: 'Conditional',
  icon: 'GitBranch',
  category: 'logic',
  handles: [
    { type: 'target', position: 'left', id: 'input', label: 'Input', style: { top: '42px' } },
    { type: 'source', position: 'right', id: 'true', label: 'True', style: { top: '50px' } },
    { type: 'source', position: 'right', id: 'false', label: 'False', style: { top: '110px' } },
  ],
  fields: [
    {
      name: 'condition',
      type: 'text',
      label: 'Condition',
      defaultValue: '',
    },
    {
      name: 'operator',
      type: 'select',
      label: 'Operator',
      options: [
        { value: 'equals', label: 'Equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'greater_than', label: 'Greater Than' },
        { value: 'less_than', label: 'Less Than' },
      ],
      defaultValue: 'equals',
    },
  ],
};

export default config;
