import type { NodeConfig } from '../../types/nodeConfig';

const config: NodeConfig = {
  type: 'merge',
  label: 'Merge',
  icon: 'GitMerge',
  category: 'transform',
  handles: [
    { type: 'target', position: 'left', id: 'input_a', label: 'Input A', style: { top: '42px' } },
    { type: 'target', position: 'left', id: 'input_b', label: 'Input B', style: { top: '110px' } },
    { type: 'source', position: 'right', id: 'merged', label: 'Merged', style: { top: '110px' } },
  ],
  fields: [
    {
      name: 'strategy',
      type: 'select',
      label: 'Merge Strategy',
      options: [
        { value: 'concat', label: 'Concatenate' },
        { value: 'zip', label: 'Zip' },
        { value: 'union', label: 'Union' },
      ],
      defaultValue: 'concat',
    },
  ],
};

export default config;
