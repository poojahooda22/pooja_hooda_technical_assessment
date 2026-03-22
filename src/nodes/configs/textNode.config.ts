import type { NodeConfig } from '../../types/nodeConfig';
import { extractVariables } from '../../utils/templateParser';

const HANDLE_TOP_OFFSET = 40;
const HANDLE_SPACING = 28;

const config: NodeConfig = {
  type: 'text',
  label: 'Text',
  icon: 'Type',
  category: 'general',
  handles: [
    { type: 'source', position: 'right', id: 'output', label: 'Output', style: { top: '50px' } },
  ],
  fields: [
    {
      name: 'text',
      type: 'smartTextarea',
      label: 'Text',
      defaultValue: '',
    },
  ],
  resolveDynamicHandles: (data, nodeId) => {
    const variables = extractVariables(data?.text as string);
    return variables.map((varName, idx) => ({
      id: `${nodeId}-${varName}`,
      type: 'target' as const,
      position: 'left' as const,
      label: varName,
      top: HANDLE_TOP_OFFSET + idx * HANDLE_SPACING,
    }));
  },
};

export default config;
