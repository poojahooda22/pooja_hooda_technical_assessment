// DraggableNode.tsx — Draggable node button for toolbar (supports drag AND click-to-add)

import React, { useRef, useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import type { Node } from 'reactflow';
import { shallow } from 'zustand/shallow';
import * as LucideIcons from 'lucide-react';
import { useStore } from '../store';
import { getInitNodeData } from '../nodes/registry';
import { UNIFIED_NODE_THEME } from '../constants/theme';
import { cn } from '../lib/utils';
import { useTheme } from '../hooks/useTheme';
import type { NodeData, StoreState } from '../types/store';

// Cascade counter — offsets each click-placed node so they don't stack
let clickPlacementCounter = 0;
const MAX_CASCADE = 10;
const GRID_SIZE = 20;

const storeSelector = (state: StoreState) => ({
  getNodeID: state.getNodeID,
  addNode: state.addNode,
});

interface DraggableNodeProps {
  type: string;
  label: string;
  icon: string;
  category: string;
}

export const DraggableNode = ({ type, label, icon }: DraggableNodeProps) => {
  const isDark = useTheme();
  const { project } = useReactFlow();
  const { getNodeID, addNode } = useStore(storeSelector, shallow);
  const dragOccurred = useRef(false);

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string): void => {
    dragOccurred.current = true;
    const appData = { nodeType };
    (event.target as HTMLDivElement).style.cursor = 'grabbing';
    event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onClick = useCallback(() => {
    if (dragOccurred.current) {
      dragOccurred.current = false;
      return;
    }

    const flowElement = document.querySelector('.react-flow');
    if (!flowElement) return;

    const bounds = flowElement.getBoundingClientRect();
    const centerFlow = project({ x: bounds.width / 2, y: bounds.height / 2 });

    const offset = (clickPlacementCounter % MAX_CASCADE) * GRID_SIZE;
    clickPlacementCounter++;

    const position = {
      x: Math.round((centerFlow.x + offset) / GRID_SIZE) * GRID_SIZE,
      y: Math.round((centerFlow.y + offset) / GRID_SIZE) * GRID_SIZE,
    };

    const nodeID = getNodeID(type);
    const newNode = {
      id: nodeID,
      type,
      position,
      data: getInitNodeData(nodeID, type) as NodeData,
    };

    addNode(newNode as Node<NodeData>);
  }, [type, project, getNodeID, addNode]);

  const IconComponent = icon
    ? (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[icon]
    : null;
  const styles = isDark ? UNIFIED_NODE_THEME.toolbarDark : UNIFIED_NODE_THEME.toolbar;

  return (
    <div
      onClick={onClick}
      onDragStart={(event) => onDragStart(event, type)}
      onDragEnd={(event) => ((event.target as HTMLDivElement).style.cursor = 'grab')}
      className={cn(
        'flex items-center gap-md px-xl py-sm rounded-md border cursor-grab text-[11px] font-medium',
        'transition-all duration-200 select-none whitespace-nowrap',
        'hover:scale-[1.02] active:scale-[0.97] motion-reduce:hover:scale-100 motion-reduce:active:scale-100',
        styles
      )}
      draggable
    >
      {IconComponent && <IconComponent size={13} />}
      <span>{label}</span>
    </div>
  );
};
