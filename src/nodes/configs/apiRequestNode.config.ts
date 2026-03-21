import type { NodeConfig } from '../../types/nodeConfig';

const config: NodeConfig = {
  type: 'apiRequest',
  label: 'API Request',
  icon: 'Globe',
  category: 'integration',
  handles: [
    { type: 'target', position: 'left', id: 'body', label: 'Body', style: { top: '50%' } },
    { type: 'source', position: 'right', id: 'response', label: 'Response', style: { top: '50%' } },
  ],
  fields: [
    {
      name: 'url',
      type: 'text',
      label: 'URL',
      defaultValue: 'https://api.example.com',
    },
    {
      name: 'method',
      type: 'select',
      label: 'Method',
      options: [
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
        { value: 'DELETE', label: 'DELETE' },
      ],
      defaultValue: 'GET',
    },
    {
      name: 'headers',
      type: 'textarea',
      label: 'Headers (JSON)',
      defaultValue: '{}',
    },
  ],
};

export default config;
