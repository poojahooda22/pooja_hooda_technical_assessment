import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import { useStore } from '../store';
import { FieldRenderer } from './FieldRenderer';
import { cn } from '../lib/utils';
import * as LucideIcons from 'lucide-react';
import { X } from 'lucide-react';
import type { NodeConfig, DynamicHandle } from '../types/nodeConfig';
import type { StoreState } from '../types/store';

interface BaseNodeProps {
  config: NodeConfig;
  id: string;
  data: Record<string, unknown>;
  selected: boolean;
}

// Position map for handles
const POSITION_MAP: Record<string, Position> = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
};

const BaseNode = memo(({ config, id, data, selected }: BaseNodeProps) => {
  const updateNodeField = useStore((s) => s.updateNodeField);
  const onNodesChange = useStore((s) => s.onNodesChange);
  const updateNodeInternals = useUpdateNodeInternals();

  // Track which handles have edges connected — for hollow vs filled dot styling
  const connectedHandleIds = useStore(
    useCallback(
      (s: StoreState): Set<string> => {
        const ids = new Set<string>();
        for (const e of s.edges) {
          if (e.source === id && e.sourceHandle) ids.add(e.sourceHandle);
          if (e.target === id && e.targetHandle) ids.add(e.targetHandle);
        }
        return ids;
      },
      [id]
    ),
    // Custom equality — only re-render when the set of connected handle IDs changes
    (a, b) => {
      if (a.size !== b.size) return false;
      for (const v of a) if (!b.has(v)) return false;
      return true;
    }
  );
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevDynamicRef = useRef<string[]>([]);

  // Resolve dynamic handles from config's pure function (if defined)
  const dynamicHandles = useMemo<DynamicHandle[]>(() => {
    if (!config.resolveDynamicHandles) return [];
    return config.resolveDynamicHandles(data, id);
  }, [config, data, id]);

  // Debounced updateNodeInternals — only when dynamic handle set actually changes
  useEffect(() => {
    if (!config.resolveDynamicHandles) return;
    const currentKeys = JSON.stringify(dynamicHandles.map((h) => h.id));
    if (currentKeys !== JSON.stringify(prevDynamicRef.current)) {
      prevDynamicRef.current = dynamicHandles.map((h) => h.id);
      const timer = setTimeout(() => updateNodeInternals(id), 150);
      return () => clearTimeout(timer);
    }
  }, [dynamicHandles, id, updateNodeInternals, config.resolveDynamicHandles]);

  // Dangling edge cleanup — remove edges to dynamic handles that no longer exist
  useEffect(() => {
    if (!config.resolveDynamicHandles) return;
    if (dynamicHandles.length === 0 && prevDynamicRef.current.length === 0) return;
    const currentIds = new Set(dynamicHandles.map((h) => h.id));
    const { edges, onEdgesChange } = useStore.getState();
    const dangling = edges.filter(
      (e) => e.target === id && e.targetHandle && !currentIds.has(e.targetHandle)
    );
    if (dangling.length > 0) {
      onEdgesChange(dangling.map((e) => ({ id: e.id, type: 'remove' as const })));
    }
  }, [dynamicHandles, id, config.resolveDynamicHandles]);

  // Initialize field values from data or config defaults
  const [fieldValues, setFieldValues] = useState<Record<string, unknown>>(() => {
    if (!config.fields) return {};
    return config.fields.reduce<Record<string, unknown>>((acc, field) => {
      const defaultVal = typeof field.defaultValue === 'function'
        ? field.defaultValue(id)
        : (field.defaultValue ?? '');
      acc[field.name] = data?.[field.name] ?? defaultVal;
      return acc;
    }, {});
  });

  // Debounced store sync (150ms)
  const handleFieldChange = (fieldName: string, value: unknown): void => {
    setFieldValues((prev) => ({ ...prev, [fieldName]: value }));
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      updateNodeField(id, fieldName, value);
    }, 150);
  };

  // Cleanup timer on unmount
  useEffect(() => () => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
  }, []);

  // Resolve lucide icon
  const IconComponent = config.icon
    ? (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[config.icon]
    : null;

  // Multi-handle nodes need extra height so handles spread properly
  const allHandles = [...(config.handles || []), ...dynamicHandles];
  const positionedHandles = allHandles.filter((h) =>
    ('style' in h && (h as { style?: React.CSSProperties }).style?.top) || ('top' in h && typeof (h as DynamicHandle).top === 'number')
  );
  const needsExtraHeight = positionedHandles.length > 1;
  const hasLeftDynamicHandles = dynamicHandles.some(h => h.position === 'left');
  const lastDynamicTop = dynamicHandles.length > 0 ? Math.max(...dynamicHandles.map(h => h.top)) : 0;
  const computedMinHeight = (needsExtraHeight || lastDynamicTop > 0)
    ? Math.max(140, lastDynamicTop + 40)
    : undefined;

  const handleDelete = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onNodesChange([{ id, type: 'remove' }]);
  };

  return (
    <div
      className={cn(
        'bg-background-alt rounded-xl shadow-md relative group',
        hasLeftDynamicHandles ? 'w-[320px]' : 'w-[240px]',
        'transition-[shadow,border-color] duration-200 hover:shadow-lg',
        selected
          ? 'border'
          : 'border border-secondary'
      )}
      style={{
        ...(computedMinHeight ? { minHeight: `${computedMinHeight}px` } : {}),
        ...(selected ? { borderColor: 'var(--rare-brand-500)' } : {}),
      }}
    >

      {/* Header */}
      <div className="flex items-center gap-md px-xl py-md bg-background-node-header rounded-t-xl">
        {IconComponent && <IconComponent size={14} className="text-foreground-tertiary" />}
        <span className="text-xs font-semibold text-foreground">{config.label}</span>
        <button
          onClick={handleDelete}
          className="ml-auto p-0.5 rounded-sm text-fg-muted hover:text-fg-secondary cursor-pointer transition-colors"
        >
          <X size={12} />
        </button>
      </div>

      {/* Body */}
      <div className={cn("py-3 pr-3 flex flex-col gap-3", hasLeftDynamicHandles ? "pl-[70px]" : "pl-3")}>
        {config.fields?.map((field) => (
          <FieldRenderer
            key={field.name}
            field={field}
            value={(fieldValues[field.name] ?? '') as string | number}
            onChange={handleFieldChange}
            nodeId={id}
          />
        ))}
      </div>

      {/* Static handles — hollow stroke when disconnected, solid fill when connected */}
      {config.handles?.map((handle) => {
        const handleId = `${id}-${handle.id}`;
        const connected = connectedHandleIds.has(handleId);

        return (
          <React.Fragment key={handle.id}>
            <Handle
              type={handle.type}
              position={POSITION_MAP[handle.position] || Position.Left}
              id={handleId}
              className="!w-2 !h-2 !rounded-full"
              style={{
                ...handle.style,
                background: connected ? 'var(--rare-brand-600)' : 'var(--rare-bg)',
                border: connected ? 'none' : '1.5px solid var(--rare-brand-500)',
              }}
            />
          </React.Fragment>
        );
      })}

      {/* Dynamic handles — same hollow/filled pattern */}
      {dynamicHandles.map((handle) => {
        const connected = connectedHandleIds.has(handle.id);
        return (
          <React.Fragment key={handle.id}>
            <Handle
              type={handle.type}
              position={POSITION_MAP[handle.position] || Position.Left}
              id={handle.id}
              className="!w-2 !h-2 !rounded-full"
              style={{
                top: `${handle.top}px`,
                background: connected ? 'var(--rare-brand-600)' : 'var(--rare-bg)',
                border: connected ? 'none' : '1.5px solid var(--rare-brand-500)',
              }}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
});

BaseNode.displayName = 'BaseNode';

export default BaseNode;
