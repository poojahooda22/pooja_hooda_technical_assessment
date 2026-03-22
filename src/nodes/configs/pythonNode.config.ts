import type { NodeConfig } from '../../types/nodeConfig';
import { extractPythonArgs } from '../../utils/templateParser';

const config: NodeConfig = {
  type: 'pythonScript',
  label: 'Python Code',
  icon: 'Terminal',
  category: 'transform',
  handles: [
    { type: 'source', position: 'right', id: 'result', label: 'Result', style: { top: '60px' } },
  ],
  fields: [
    { name: 'code', type: 'textarea', label: 'Python Code', defaultValue: 'def run():\n  pass' },
  ],
  resolveDynamicHandles: (data, nodeId) => {
    const args = extractPythonArgs(data?.code as string);
    return args.map((arg, idx) => ({
      id: `${nodeId}-${arg}`,
      type: 'target' as const,
      position: 'left' as const,
      label: arg,
      top: 50 + idx * 30,
    }));
  },
};

export default config;
