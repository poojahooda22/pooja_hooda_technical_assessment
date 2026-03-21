import { getBezierPath, BaseEdge, EdgeLabelRenderer, EdgeProps } from 'reactflow';
import { useStore } from '../store';
import { X } from 'lucide-react';

export const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
}: EdgeProps) => {
  const onEdgesChange = useStore((s) => s.onEdgesChange);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    onEdgesChange([{ id, type: 'remove' }]);
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: '#528bff',
          strokeWidth: 1.5,
          strokeDasharray: '6 4',
        }}
      />
      <EdgeLabelRenderer>
        <button
          onClick={handleDelete}
          style={{
            position: 'absolute',
            left: labelX,
            top: labelY,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'all',
          }}
          className="w-[14px] h-[14px] flex items-center justify-center rounded-full
                     bg-background cursor-pointer transition-colors
                     border border-error hover:border-error-solid hover:bg-background-error"
          title="Remove connection"
        >
          <X size={7} strokeWidth={2.5} className="text-fg-error" />
        </button>
      </EdgeLabelRenderer>
    </>
  );
};
