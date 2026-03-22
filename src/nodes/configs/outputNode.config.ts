import type { NodeConfig } from '../../types/nodeConfig';

const config: NodeConfig = {
  type: 'customOutput',
  label: 'Output',
  icon: 'ArrowLeftFromLine',
  category: 'general',
  handles: [
    { type: 'target', position: 'left', id: 'value', label: 'Value', style: { top: '100px' } },
  ],
  fields: [
    {
      name: 'outputName',
      type: 'text',
      label: 'Name',
      defaultValue: (id: string) => id.replace('customOutput-', 'output_'),
    },
    {
      name: 'outputType',
      type: 'select',
      label: 'Type',
      options: [
        { value: 'Text', label: 'Text' },
        { value: 'Image', label: 'Image' },
      ],
      defaultValue: 'Text',
    },
    {
      name: 'outputValue',
      type: 'smartTextarea',
      label: 'Output',
      defaultValue: '',
    },
  ],
};

export default config;
