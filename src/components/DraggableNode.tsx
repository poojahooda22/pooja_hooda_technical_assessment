// DraggableNode.tsx — Draggable node button for toolbar

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { CATEGORY_THEME } from '../constants/theme';
import { cn } from '../lib/utils';
import { useTheme } from '../hooks/useTheme';

interface DraggableNodeProps {
  type: string;
  label: string;
  icon: string;
  category: string;
}

export const DraggableNode = ({ type, label, icon, category }: DraggableNodeProps) => {
  const isDark = useTheme();

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string): void => {
    const appData = { nodeType };
    (event.target as HTMLDivElement).style.cursor = 'grabbing';
    event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const IconComponent = icon
    ? (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[icon]
    : null;
  const cat = CATEGORY_THEME[category] || CATEGORY_THEME.utility;
  const styles = isDark ? cat.toolbarDark : cat.toolbar;

  return (
    <div
      onDragStart={(event) => onDragStart(event, type)}
      onDragEnd={(event) => ((event.target as HTMLDivElement).style.cursor = 'grab')}
      className={cn(
        'flex items-center gap-md px-xl py-md rounded-md border cursor-grab text-xs font-medium',
        'transition-all duration-200 select-none',
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
