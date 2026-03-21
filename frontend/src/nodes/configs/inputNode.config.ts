import type { NodeConfig } from '../../types/nodeConfig';

const config: NodeConfig = {
  type: 'customInput',
  label: 'Input',
  icon: 'ArrowRightToLine',
  category: 'general',
  handles: [
    { type: 'source', position: 'right', id: 'value', label: 'Value', style: { top: '55%' } },
  ],
  fields: [
    {
      name: 'inputName',
      type: 'text',
      label: 'Name',
      defaultValue: (id: string) => id.replace('customInput-', 'input_'),
    },
    {
      name: 'inputType',
      type: 'select',
      label: 'Type',
      options: [
        { value: 'Text', label: 'Text' },
        { value: 'File', label: 'File' },
      ],
      defaultValue: 'Text',
    },
  ],
};

export default config;
