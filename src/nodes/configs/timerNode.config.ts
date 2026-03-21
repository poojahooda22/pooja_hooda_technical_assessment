import type { NodeConfig } from '../../types/nodeConfig';

const config: NodeConfig = {
  type: 'timer',
  label: 'Timer',
  icon: 'Timer',
  category: 'utility',
  handles: [
    { type: 'target', position: 'left', id: 'trigger', label: 'Trigger', style: { top: '50%' } },
    { type: 'source', position: 'right', id: 'output', label: 'Output', style: { top: '50%' } },
  ],
  fields: [
    {
      name: 'delay',
      type: 'slider',
      label: 'Delay',
      defaultValue: 5,
      min: 0,
      max: 60,
      step: 1,
    },
    {
      name: 'unit',
      type: 'select',
      label: 'Unit',
      options: [
        { value: 'ms', label: 'Milliseconds' },
        { value: 'sec', label: 'Seconds' },
        { value: 'min', label: 'Minutes' },
      ],
      defaultValue: 'sec',
    },
  ],
};

export default config;
