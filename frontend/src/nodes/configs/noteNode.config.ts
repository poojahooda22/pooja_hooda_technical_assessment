import type { NodeConfig } from '../../types/nodeConfig';

const config: NodeConfig = {
  type: 'note',
  label: 'Note',
  icon: 'StickyNote',
  category: 'utility',
  handles: [],
  fields: [
    {
      name: 'content',
      type: 'textarea',
      label: 'Note',
      defaultValue: '',
    },
  ],
};

export default config;
