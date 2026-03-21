# Deep Dive: The Node Implementation Architecture (TypeScript)

This document breaks down the newly implemented "Resolver" node architecture line-by-line and chunk-by-chunk. By reading this, you will understand exactly how `BaseNode.tsx`, configurations, and registries work together to solve the node abstraction problem.

---

## 1. The Blueprint: `types/nodeConfig.ts`
Before writing React components, we define the exact "shape" of a node using TypeScript interfaces. This is the raw JSON definition the system expects.

```typescript
// types/nodeConfig.ts
export interface FieldSpec {
  name: string;        // The variable name in the database (e.g., "apiKey")
  type: FieldType;     // 'text' | 'select' | 'textarea' | etc.
  label: string;       // User-facing label (e.g., "API Key")
  defaultValue?: string | number | ((nodeId: string) => string);
  options?: FieldOption[]; // For select dropdowns
}

export interface NodeConfig {
  type: string;        // e.g., "llm", "twitterApi"
  label: string;       // e.g., "LLM Node"
  icon: string;        // Lucide icon name
  category: string;    // "General", "AI", etc. used for colors
  handles: HandleSpec[]; // Static handles that never move
  fields?: FieldSpec[];  // The UI inputs this node expects
  
  // THE MAGIC: A pure function that takes the current user inputs and generates dynamic handles
  resolveDynamicHandles?: (data: Record<string, unknown>, nodeId: string) => DynamicHandle[];
}
```
**Why do this?** 
It forces every new node to conform to a strict schema. You can't accidentally typo a field type, because TypeScript will throw a compile error.

---

## 2. The Assembly Line: `registry.tsx`
React Flow expects a dictionary of React Components (e.g., `{ llm: LLMComponent, input: InputComponent }`). Since we only use *one* component (`BaseNode`), the registry dynamically builds this dictionary for React Flow.

```tsx
// 1. We import all raw config objects
import llmConfig from './configs/llmNode.config';
// ...
const allConfigs: NodeConfig[] = [llmConfig, textConfig, /*...*/];

// 2. The Factory Function
const createNodeComponent = (config: NodeConfig) =>
  memo(({ id, data, selected }: BaseNodeWrapperProps) => (
    <BaseNode config={config} id={id} data={data} selected={selected} />
  ));

// 3. The React Flow Export
export const nodeTypes = Object.fromEntries(
  allConfigs.map((cfg) => [cfg.type, createNodeComponent(cfg)])
);
```
**Explanation:** 
`createNodeComponent` is a Higher-Order Function. It takes a raw JSON `config` and spits out a fully weaponized React Component wrapped in `memo` (for performance). `Object.fromEntries` turns the array into `{ llm: <MemoizedBaseNode(llmConfig) /> }`, which is exactly what React Flow needs.

---

## 3. The UI Switchboard: `FieldRenderer.tsx`
`BaseNode` shouldn't care *how* a text input works. It just loops through `config.fields` and asks `FieldRenderer` to draw them.

```tsx
// FieldRenderer.tsx
const FIELD_COMPONENTS: Record<string, FieldComponent> = {
  text: TextField,
  select: SelectField,
  textarea: TextAreaField,
  smartTextarea: SmartTextareaField,
};

export const FieldRenderer = ({ field, value, onChange, nodeId }) => {
  // 1. Look up the specific React component based on the string type
  const Component = FIELD_COMPONENTS[field.type];
  if (!Component) return null;

  // 2. Render it, passing down the generic props
  return (
    <Component
      name={field.name}
      label={field.label}
      value={value}
      onChange={onChange}
      nodeId={nodeId}
      {...(field.options && { options: field.options })}
    />
  );
};
```
**Explanation:** 
This is the "Strategy Pattern." If you add a new field type (like a `DateSelector`), you just build `DateField.tsx`, add it to the `FIELD_COMPONENTS` dictionary, and instantly ANY node can start using `{ type: 'date' }` in its config.

---

## 4. The Universal Engine: `BaseNode.tsx`
This is the master component. It replaces 100s of custom files. Let's look at its critical chunks.

### Chunk 4A: Resolving Dynamic Handles
```tsx
const dynamicHandles = useMemo<DynamicHandle[]>(() => {
  if (!config.resolveDynamicHandles) return [];
  // Passes the user's typed data (e.g., "Hello {{name}}") into the pure function
  return config.resolveDynamicHandles(data, id); 
}, [config, data, id]);
```
**Explanation:** Every time the user types (`data` changes), this block checks if the config has a `resolveDynamicHandles` function (like the Text or LLM nodes do). If so, it executes it to figure out where new handles should appear.

### Chunk 4B: React Flow Sync & Cleanup
```tsx
useEffect(() => {
  // 1. Detect if dynamic handles actually shifted position or count
  const currentKeys = JSON.stringify(dynamicHandles.map((h) => h.id));
  if (currentKeys !== JSON.stringify(prevDynamicRef.current)) {
    prevDynamicRef.current = dynamicHandles.map((h) => h.id);
    
    // 2. Tell React Flow to re-draw the edge lines (debounced by 150ms for performance)
    const timer = setTimeout(() => updateNodeInternals(id), 150);
    return () => clearTimeout(timer);
  }
}, [dynamicHandles, id, updateNodeInternals]);
```
**Explanation:** When handles appear/disappear based on variables typed by the user, the connecting lines (edges) will point to empty space unless we call `updateNodeInternals()`. We use strict `JSON.stringify` comparison so we don't spam React Flow on every single keystroke.

### Chunk 4C: State Management (Fast Local vs Slow Store)
```tsx
const [fieldValues, setFieldValues] = useState(() => { /* init logic */ });

const handleFieldChange = (fieldName: string, value: unknown) => {
  // 1. INSTANT UI update for smooth typing (Local State)
  setFieldValues((prev) => ({ ...prev, [fieldName]: value }));
  
  // 2. DELAYED global store update (Zustand)
  if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
  syncTimerRef.current = setTimeout(() => {
    updateNodeField(id, fieldName, value);
  }, 150);
};
```
**Explanation:** If we sent every keystroke to the global Zustand `store`, the entire canvas would re-render on every letter, causing massive lag. By storing typing in local `useState` instantly, and delaying the global network save by 150ms (Debouncing), the UI remains buttery smooth even at 500+ nodes.

### Chunk 4D: The DOM Render
```tsx
return (
  <div className="bg-background rounded-md border-l-[3px] relative">
    
    {/* 1. Header with Icon and Title */}
    <div className="flex items-center px-3 py-1.5 ...">
      <IconComponent size={14} />
      <span>{config.label}</span>
    </div>

    {/* 2. Renders all fields dynamically via the Switchboard */}
    <div className="px-3 py-3 flex flex-col gap-3">
      {config.fields?.map((field) => (
         <FieldRenderer ... />
      ))}
    </div>

    {/* 3. Render STATIC handles exactly where the config dictated */}
    {config.handles?.map((handle) => (
      <Handle position={POSITION_MAP[handle.position]} style={handle.style} ... />
    ))}

    {/* 4. Render DYNAMIC handles generated by the pure function */}
    {dynamicHandles.map((handle) => (
      <Handle position={POSITION_MAP[handle.position]} style={{ top: `${handle.top}px` }} ... />
    ))}
  </div>
);
```
**Explanation:** Note the `className="... relative"` on the outer `<div>`. Because this is the ONLY relative container, React Flow's `position: absolute` handles snap perfectly to the absolute left and right borders of the node. We loop through the fields to draw the center, loop through the static handles (like `system` or `output`), and loop through the dynamic handles (like `{{name}}`), rendering everything procedurally.
