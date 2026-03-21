import type { NodeConfig } from '../../types/nodeConfig';

const config: NodeConfig = {
  type: 'twitterApi',
  label: 'Twitter Post',
  icon: 'Twitter',
  category: 'integration',
  handles: [
    { type: 'target', position: 'left', id: 'content', label: 'Tweet Content', style: { top: '54%' } },
    { type: 'source', position: 'right', id: 'success', label: 'Success', style: { top: '54%' } },
  ],
  fields: [
    { name: 'apiKey', type: 'text', label: 'API Key' },
    { name: 'autoPost', type: 'select', label: 'Auto Post', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
  ],
};

export default config;
