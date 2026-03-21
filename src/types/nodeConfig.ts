// nodeConfig.ts — Type definitions for the node config system

import { CSSProperties } from 'react';

export interface HandleSpec {
  type: 'source' | 'target';
  position: 'left' | 'right' | 'top' | 'bottom';
  id: string;
  label?: string;
  style?: CSSProperties;
}

export interface DynamicHandle {
  id: string;
  type: 'source' | 'target';
  position: 'left' | 'right' | 'top' | 'bottom';
  label?: string;
  top: number;
}

export type FieldType = 'text' | 'select' | 'textarea' | 'slider' | 'smartTextarea';

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldSpec {
  name: string;
  type: FieldType;
  label: string;
  defaultValue?: string | number | ((nodeId: string) => string);
  options?: FieldOption[];
  min?: number;
  max?: number;
  step?: number;
}

export interface NodeConfig {
  type: string;
  label: string;
  icon: string;
  category: string;
  handles: HandleSpec[];
  fields?: FieldSpec[];
  resolveDynamicHandles?: (data: Record<string, unknown>, nodeId: string) => DynamicHandle[];
}
