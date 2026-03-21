# Plan 10: The Final Execution Plan — All Corrections Applied

**Author**: Claude (Opus 4.6)
**Timestamp**: 2026-03-22T01:30:00+05:30
**Status**: EXECUTION-READY — Total convergence. All risks analyzed. All corrections applied.
**Standard**: rules-for-work.md
**Review History**: 10 plans, 5 rounds Claude-Gemini debate, 1 assessment audit, 1 risk analysis → **FINAL**

---

## Convergence Confirmation

Both AIs agree on EVERY decision. Gemini's Plan 11 explicitly accepted all corrections:

| Decision | Both Agree | Evidence |
|----------|-----------|----------|
| Config-driven factory | Yes | 6/6 production editors |
| Resolver pattern (`resolveDynamicHandles`) | Yes | React Router/TanStack precedent |
| Pure `extractVariables()` utility | Yes | Testable without React |
| Eliminate escape hatch | Yes | 22% bypass = leaky abstraction |
| `strict: true` WITHOUT `exactOptionalPropertyTypes` | Yes | @types/react incompatible |
| Zustand `create<StoreState>()((set, get) => {...})` | Yes | Correct v4 pattern |
| Skip TanStack Query | Yes | YAGNI — 1 API call |
| JS auto-sizing (not field-sizing) | Yes | Firefox no support |
| Tailwind stays (not CSS vars) | Yes | Tailwind v4 IS CSS vars |
| YAGNI backend | Yes | 67 lines is correct |

---

## Risk Corrections (from final verification research)

### 1. Do NOT Delete TextNodeContent/LLMNodeContent Upfront

**Risk**: Both files are imported by their config files. Deleting them breaks the build immediately.

**Corrected order**:
1. First: rewrite `textNode.config.js` to use `variableText` field + `resolveDynamicHandles` (remove `renderContent` import)
2. First: rewrite `llmNode.config.js` to use `smartTextarea` field (remove `renderContent` import)
3. Verify: `npm start` builds without `TextNodeContent` or `LLMNodeContent` being imported
4. THEN: delete both files safely

### 2. Preserve `prevVarsRef` Guard in BaseNode

**Risk**: `useMemo` with `data` dependency recalculates on every debounced store update. Without a guard, `updateNodeInternals` fires unnecessarily on every keystroke.

**Solution**: BaseNode's dynamic handle `useEffect` must compare current handles with previous via `JSON.stringify` before calling `updateNodeInternals`:
```jsx
useEffect(() => {
  const currentKeys = JSON.stringify(dynamicHandles.map(h => h.id));
  if (currentKeys !== JSON.stringify(prevDynamicRef.current)) {
    prevDynamicRef.current = dynamicHandles.map(h => h.id);
    const timer = setTimeout(() => updateNodeInternals(id), 150);
    return () => clearTimeout(timer);
  }
}, [dynamicHandles, id, updateNodeInternals]);
```

### 3. TypeScript Setup Order

**Risk**: CRA 5 only enables `.ts/.tsx` resolution when `tsconfig.json` exists.

**Corrected order**:
1. `npm install --save-dev typescript @types/react @types/react-dom @types/node`
2. Run `npm start` — CRA auto-generates `tsconfig.json` + `react-app-env.d.ts`
3. THEN begin renaming files

### 4. CRA 5 Enforces `isolatedModules: true`

No `const enum`. Use string literal unions or plain objects instead:
```typescript
// WRONG (CRA will reject):
const enum Category { IO = 'io', AI = 'ai' }

// CORRECT:
type Category = 'general' | 'llm' | 'logic' | 'transform' | 'integration' | 'utility';
```

### 5. Zustand `shallow` Import

Confirmed already used in codebase. Import: `import { shallow } from 'zustand/shallow'`

---

## 5-Phase Execution (Corrected Order)

### Phase A: Bug Fixes (30 min)

**A1. Fix fan-in validation** — `frontend/src/components/PipelineCanvas.jsx`
```javascript
// BEFORE (blocks fan-in):
const duplicate = currentEdges.some(
  (e) => e.target === connection.target && e.targetHandle === connection.targetHandle
);

// AFTER (only blocks true duplicates):
const duplicate = currentEdges.some(
  (e) =>
    e.source === connection.source &&
    e.sourceHandle === connection.sourceHandle &&
    e.target === connection.target &&
    e.targetHandle === connection.targetHandle
);
```

**A2. Fix handle "relative trap"** — `frontend/src/nodes/TextNodeContent.jsx`
- Remove `className="relative"` from the outer wrapper div (line 110)
- Handles will snap to BaseNode's root `relative` container instead

**Verify**: Connect 2 Input nodes to LLM's prompt handle — should work. Check handles are on node border.

---

### Phase B: Resolver Pattern (2-3 hrs)

**B1. Create pure utility** — NEW: `frontend/src/utils/templateParser.js`
```javascript
const VAR_REGEX = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;
export const extractVariables = (text) => {
  if (!text) return [];
  const matches = [...text.matchAll(VAR_REGEX)];
  return [...new Set(matches.map((m) => m[1]))];
};
```

**B2. Enhance BaseNode** — `frontend/src/nodes/BaseNode.jsx` (~25 lines added)
- Import `useUpdateNodeInternals` from React Flow
- `useMemo`: call `config.resolveDynamicHandles(data, id)` if it exists
- `useEffect`: debounced `updateNodeInternals` with `prevDynamicRef` guard
- `useEffect`: dangling edge cleanup
- Render: dynamic handles with labels alongside static handles

**B3. Create SmartTextareaField** — NEW: `frontend/src/nodes/fields/SmartTextareaField.jsx`
- Textarea with `useNodeDropdown` for `{{ }}` autocomplete
- Local state + debounced sync
- No handle logic (that's BaseNode's job via resolver)

**B4. Register field type** — `frontend/src/nodes/FieldRenderer.jsx`
- Add `smartTextarea: SmartTextareaField` to `FIELD_COMPONENTS`

**B5. Rewrite textNode config** — `frontend/src/nodes/configs/textNode.config.js`
- Remove `import { TextNodeContent }` and `renderContent`
- Add `resolveDynamicHandles` using `extractVariables`
- Use `variableText` field for text input

**B6. Rewrite llmNode config** — `frontend/src/nodes/configs/llmNode.config.js`
- Remove `import { LLMNodeContent }` and `renderContent`
- Use `smartTextarea` for prompt field
- Use `textarea` for system field
- Use `text` for name, `select` for model

**B7. Delete escape hatch files** (AFTER configs no longer import them)
- Delete `frontend/src/nodes/TextNodeContent.jsx`
- Delete `frontend/src/nodes/LLMNodeContent.jsx`

**Verify**: Text node shows {{ }} variables with labeled handles. LLM node has prompt dropdown. Both are pure config. `npm start` builds.

---

### Phase C: Assessment Polish (1 hr)

**C1. Handle labels on all 9 configs** — Every handle gets a `label` property
**C2. VectorShift categories** — Input/Output/Text → `general`, LLM → `llm`. Add to `theme.js`.
**C3. Toolbar grouping** — `PipelineToolbar.jsx` groups by category with section headers
**C4. Extract `useTheme` hook** — NEW: `frontend/src/hooks/useTheme.js`. Replace duplicated MutationObserver in BaseNode + DraggableNode.
**C5. CustomEdge dark mode** — `bg-white` → `bg-background` in `CustomEdge.jsx`

**Verify**: Visual inspection — labels visible, toolbar grouped, categories match VectorShift, dark mode consistent.

---

### Phase D: Performance (30 min)

**D1. Narrow `useNodeDropdown` selector** — `frontend/src/hooks/useNodeDropdown.js`
```javascript
import { shallow } from 'zustand/shallow';
const availableNodes = useStore(
  useCallback((s) => s.nodes
    .filter(n => n.id !== nodeId)
    .map(n => ({ id: n.id, type: n.type })),
  [nodeId]),
  shallow
);
```

**D2. MiniMap nodeColor** — `frontend/src/components/PipelineCanvas.jsx`
- Module-level `NODE_COLOR_MAP` from `nodeConfigs`
- `useCallback` for `getNodeColor`

**Verify**: React DevTools Profiler — typing in one node doesn't re-render others.

---

### Phase E: TypeScript Full Migration (4-6 hrs)

**E1. Foundation**
- Install: `typescript @types/react @types/react-dom @types/node`
- Run `npm start` → CRA generates `tsconfig.json`
- Set `strict: true` (NO `exactOptionalPropertyTypes`)
- Create `types/nodeConfig.ts`, `types/store.ts`

**E2. Convert file-by-file** (run `npx tsc --noEmit` after EACH)

Order: utils (.ts) → constants (.ts) → hooks (.ts) → store (.ts) → configs (.ts with `satisfies`) → fields (.tsx) → nodes (.tsx) → pages (.tsx) → entry (.tsx)

Every file gets proper types. No `any` unless absolutely necessary. No `@ts-ignore`.

**E3. Final verification**
- `npx tsc --noEmit` = ZERO errors
- `npm start` = builds and runs
- Manual test: every node type, every field, every connection, submit pipeline

---

## Score Projection

| Part | Before | After | Key Changes |
|------|--------|-------|-------------|
| Node Abstraction | 7/10 | **9.5/10** | Resolver pattern, zero escape hatches, TypeScript configs |
| Styling | 6.5/10 | **9/10** | Handle labels, category grouping, VectorShift taxonomy |
| Text Node Logic | 8.5/10 | **9.5/10** | Pure utility, labeled handles, resolver |
| Backend | 8/10 | **8.5/10** | Fan-in bug fix |
| **Overall** | **7.2/10** | **9/10+** | |

---

## Conclusion

This is the end of planning. 10 plans, 5 rounds of peer review, 2 confirmed bugs, 3 performance fixes, full TypeScript migration. Every decision has been debated, verified against primary sources, and stress-tested for risks.

The architecture is sound. The execution order is optimal. Both AIs agree. Time to build.
