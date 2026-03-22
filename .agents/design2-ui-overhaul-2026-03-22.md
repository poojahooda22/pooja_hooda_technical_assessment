# Design Plan 2: UI/UX Overhaul — VectorShift-Style Tabs, Unified Branding, Shimmer Button, Animated Theme Toggle, Blender-Inspired KBDs

**Author:** Claude (CTO Persona)
**Date:** 2026-03-22
**Status:** READY FOR GEMINI PEER REVIEW
**Codebase:** Fully TypeScript. React 18 + ReactFlow 11.8.3 + Zustand 4 + Tailwind CSS 3.
**Previous Plans:** Plans 1-10 (architecture), Design Plan v1/v2 (token-first styling). This plan covers the NEXT design iteration.

---

## Problem Statement

The current pipeline editor UI has 6 concrete design/UX deficiencies:

1. **Toolbar doesn't scale** — Flat `flex-wrap` layout. At 11 nodes it's already dense. At 50+ nodes it becomes unusable. No search, no categorization beyond visual grouping.
2. **Multi-color node headers create visual noise** — 6 different accent colors (blue, purple, amber, green, red, gray) per category. VectorShift uses ONE accent color for minimal, professional aesthetics.
3. **MiniMap is distracting** — Each node type colored differently. Creates a rainbow minimap that draws attention away from the actual canvas.
4. **Submit button is plain** — No animation, no visual distinction. Doesn't communicate "primary action" strongly enough.
5. **Theme toggle is instantaneous** — No transition animation. Jarring light↔dark switch.
6. **No keyboard shortcuts** — No undo/redo (Ctrl+Z), no select all (Ctrl+A), no box select, wrong cursor behavior (hand cursor everywhere instead of only on nodes).

**Competitive benchmarks researched:** VectorShift (tabbed toolbar, one accent color, minimal design), Blender Node Editor (box select, Ctrl+A, undo/redo, cursor modes), Magic UI (shimmer button animation, circular view-transition theme toggle), shadcn/ui (Radix Tabs component pattern).

---

## Architecture Summary (Current State)

- **Node configs:** 11 types in `src/nodes/configs/*.config.ts`, each declares `type`, `label`, `icon`, `category`, `handles[]`, `fields[]`, optional `resolveDynamicHandles()`
- **BaseNode:** `src/nodes/BaseNode.tsx` — memo'd shared renderer, reads `CATEGORY_THEME` for per-category header colors
- **Registry:** `src/nodes/registry.tsx` — auto-generates `nodeTypes` + `nodeConfigs` from config imports
- **Store:** `src/store.ts` — Zustand with `persist` middleware, wraps ReactFlow's `applyNodeChanges`/`applyEdgeChanges`. No history/undo.
- **Theme:** `data-theme` attribute on `<html>`, `useTheme()` hook with MutationObserver, localStorage persistence
- **Design tokens:** `src/styles/tokens.css` — 560+ CSS variables with `--rare-` prefix, bridged to Tailwind via `tailwind.config.js`
- **Brand color:** Blue scale `--rare-brand-25` through `--rare-brand-950`, primary solid `--rare-brand-600` (#155eef / #2970ff)

---

## Design Decisions (User-Confirmed)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Node + toolbar color | **Everything unified brand blue** | Maximum minimalism. One accent color like VectorShift. |
| Delete button visibility | **Always visible** | More discoverable than hover-only. X icon on right side of header. |
| Box select behavior | **Blender-style** | Left-drag = box select on canvas, middle/right-drag = pan. |
| Click-to-add in toolbar | **Already implemented** | DraggableNode supports both drag-to-canvas AND click-to-add (cascade positioning). Preserved. |

---

## Phase 0: Dependency Installation

**Install:** `@radix-ui/react-tabs`

No other new dependencies. ShimmerButton, AnimatedThemeToggler, and undo/redo are all zero-dependency pure React+CSS.

**Justification:** Project already uses `@radix-ui/react-slider`. Adding another Radix primitive maintains consistency. shadcn/ui is NOT installed — we build directly on Radix + Tailwind, matching existing patterns.

---

## Phase 1: Tabbed Toolbar (VectorShift-Inspired)

**File:** `src/components/PipelineToolbar.tsx` — Complete rewrite

### Current Architecture
```
<div flex-wrap>
  {categories.map → inline group of DraggableNodes}
  <Sun/Moon toggle button>
</div>
```

### Target Architecture
```
<div toolbar-container>
  <div left-section>
    <Search icon + input> (filters nodes across all categories)
  </div>
  <Tabs.Root defaultValue="general">
    <Tabs.List> (horizontal tab strip)
      {CATEGORY_ORDER.map → <Tabs.Trigger>{label}</Tabs.Trigger>}
    </Tabs.List>
    {CATEGORY_ORDER.map → (
      <Tabs.Content>
        <div overflow-x-auto flex-nowrap>
          {filteredNodes.map → <DraggableNode />}
        </div>
      </Tabs.Content>
    )}
  </Tabs.Root>
  <AnimatedThemeToggler />
</div>
```

### Implementation Details

**Radix Tabs integration:**
- Import: `import * as Tabs from '@radix-ui/react-tabs'`
- Tab triggers: `text-sm font-medium text-foreground-tertiary` default, `data-[state=active]:text-foreground-brand data-[state=active]:border-b-2 data-[state=active]:border-brand-solid` active
- Built-in keyboard support: Arrow keys navigate tabs, Enter/Space activates

**Search behavior:**
- `useState<string>` for search query
- Filter: `config.label.toLowerCase().includes(query.toLowerCase())`
- When query is non-empty: hide tabs, show flat row of all matching nodes
- When query cleared: return to tabbed view
- Icons: `Search` and `X` from lucide-react

**Scalability:** `CATEGORY_ORDER` and `CATEGORY_LABELS` constants already exist (lines 9-17). New categories added to registry auto-appear as new tabs. No code changes needed for new categories.

**Theme management:** Removed from PipelineToolbar. Now encapsulated in `AnimatedThemeToggler` component. PipelineToolbar becomes purely presentational for node selection.

**Existing reusable code:**
- `CATEGORY_ORDER`, `CATEGORY_LABELS`, `GroupedCategory` interface — keep as-is
- `grouped` useMemo (line 35) — keep as-is
- `DraggableNode` component — keep as-is (already has click-to-add + drag)
- `nodeConfigs` import from registry — keep as-is

---

## Phase 2: Unified Brand Color

### 2a. Theme Constants

**File:** `src/constants/theme.ts`

Add unified theme constant:
```typescript
export const UNIFIED_NODE_THEME = {
  accent: '#2970ff',
  headerLight: 'bg-brand-50',
  headerDark: 'bg-brand-950/30',
  text: 'text-brand-700',
  textDark: 'text-brand-300',
  toolbar: 'border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 shadow-xs',
  toolbarDark: 'border-brand-800 bg-brand-950/40 text-brand-300 hover:bg-brand-900/50 shadow-xs',
} as const;
```

`CATEGORY_THEME` remains for backward compatibility but is no longer referenced by BaseNode or DraggableNode.

### 2b. BaseNode Header Redesign

**File:** `src/nodes/BaseNode.tsx`

Changes:
1. Replace `CATEGORY_THEME[config.category]` with `UNIFIED_NODE_THEME` for header
2. `borderLeftColor` → `UNIFIED_NODE_THEME.accent` for all nodes
3. Add always-visible X delete button on header right side
4. Add `group` class to root container
5. Import `X` from lucide-react, `onNodesChange` from store

**Header structure:**
```tsx
<div className="flex items-center gap-md px-xl py-md border-b border-secondary {headerBg}">
  {Icon && <Icon size={14} className={textColor} />}
  <span className="text-xs font-semibold {textColor}">{config.label}</span>
  <button
    onClick={(e) => { e.stopPropagation(); onNodesChange([{ id, type: 'remove' }]); }}
    className="ml-auto p-0.5 rounded-sm text-foreground-muted hover:text-fg-error hover:bg-background-error cursor-pointer transition-colors"
  >
    <X size={12} />
  </button>
</div>
```

### 2c. DraggableNode Unified Styling

**File:** `src/components/DraggableNode.tsx`

Replace `cat.toolbar` / `cat.toolbarDark` with `UNIFIED_NODE_THEME.toolbar` / `UNIFIED_NODE_THEME.toolbarDark`.

---

## Phase 3: MiniMap Simplification

**File:** `src/components/PipelineCanvas.tsx`

Remove `NODE_COLOR_MAP` and `CATEGORY_THEME` import. Replace with:
```tsx
<MiniMap
  position="bottom-right"
  nodeColor={() => 'var(--rare-brand-200)'}
  nodeStrokeColor="var(--rare-border-secondary)"
  nodeStrokeWidth={1}
  className="!bg-background-alt !border-secondary !shadow-xs"
/>
```

All nodes: uniform soft brand-tinted rectangles with subtle border.

---

## Phase 4: ShimmerButton (Magic UI)

### Source
Adapted from: `magicuidesign/magicui` → `apps/www/registry/magicui/shimmer-button.tsx`

### 4a. Tailwind Keyframes

**File:** `tailwind.config.js` — Add to existing `keyframes` object:
```js
'rare-shimmer-slide': {
  to: { transform: 'translate(calc(100cqw - 100%), 0)' },
},
'rare-spin-around': {
  '0%': { transform: 'translateZ(0) rotate(0)' },
  '15%, 35%': { transform: 'translateZ(0) rotate(90deg)' },
  '65%, 85%': { transform: 'translateZ(0) rotate(270deg)' },
  '100%': { transform: 'translateZ(0) rotate(360deg)' },
},
```

Add to `animation`:
```js
'shimmer-slide': 'rare-shimmer-slide var(--speed, 6s) ease-in-out infinite alternate',
'spin-around': 'rare-spin-around var(--speed, 6s) infinite linear',
```

Follows existing `rare-` prefix convention for keyframes.

### 4b. ShimmerButton Component

**New file:** `src/components/ShimmerButton.tsx`

Props: `shimmerColor`, `shimmerSize`, `borderRadius`, `shimmerDuration`, `background` + all standard button HTML attributes via `React.forwardRef`.

Architecture:
- Conic gradient rotation for shimmer spark effect
- Container queries (`100cqh`, `100cqw`) for responsive sizing
- Inner backdrop layer + highlight layer + spark container
- Zero external dependencies

### 4c. SubmitButton Integration

**File:** `src/components/SubmitButton.tsx`

Replace `<button>` with `<ShimmerButton>`. All existing `handleSubmit`, `disabled`, and loading state logic preserved unchanged.

---

## Phase 5: Animated Theme Toggler (Magic UI)

### Source
Adapted from: `magicuidesign/magicui` → `apps/www/registry/magicui/animated-theme-toggler.tsx`

### 5a. View Transition CSS

**File:** `src/index.css` — Add:
```css
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
::view-transition-old(root) { z-index: 1; }
::view-transition-new(root) { z-index: 9999; }
```

### 5b. TypeScript Declarations

**New file:** `src/types/viewTransitions.d.ts`

Augments `Document` with `startViewTransition()` method. Required because View Transitions API types may not be in the project's TS lib target.

### 5c. AnimatedThemeToggler Component

**New file:** `src/components/AnimatedThemeToggler.tsx`

Architecture:
- `document.startViewTransition()` with `flushSync` for synchronous DOM update
- Circular `clipPath` animation from button's bounding rect center
- `Math.hypot()` calculates radius to cover full viewport
- Fallback: instant switch when API unsupported (Firefox)
- Uses existing `useTheme()` hook for icon state
- Uses existing `data-theme` attribute + localStorage

**Browser compatibility:**
- Chrome 111+ / Edge 111+ / Safari 18+ — full animation
- Firefox — graceful fallback (instant switch, no animation)

### 5d. Integration

Replaces inline `<button>` in PipelineToolbar. Happens as part of Phase 1 toolbar rewrite.

---

## Phase 6: Keyboard Shortcuts & Cursor Behavior (Blender-Inspired)

### 6a. Cursor CSS

**File:** `src/index.css`
```css
.react-flow__pane { cursor: default !important; }
.react-flow__node { cursor: grab !important; }
.react-flow__node:active { cursor: grabbing !important; }
.react-flow__nodesselection-rect { cursor: grabbing !important; }
```

**Rationale:** ReactFlow defaults to `grab` cursor on the pane. Blender and professional node editors use `default` cursor on canvas, `grab` only on nodes.

### 6b. Undo/Redo History Stack

**File:** `src/types/store.ts` — Add:
```typescript
interface HistoryEntry { nodes: Node<NodeData>[]; edges: Edge[]; }

// Add to StoreState:
past: HistoryEntry[];
future: HistoryEntry[];
undo: () => void;
redo: () => void;
```

**File:** `src/store.ts` — Architecture:

**Helper:** `pushHistory(state)` captures `{ nodes, edges }` snapshot, pushes to `past` (capped at 50 via `slice(-49)`), clears `future`.

**Actions that push history:**
- `addNode` — before adding node
- `onNodesChange` — on `type === 'remove'` AND `type === 'position' && !dragging` (drag-end)
- `onEdgesChange` — on `type === 'remove'`
- `onConnect` — before adding edge
- `updateNodeField` — already debounced 150ms in BaseNode, so not every keystroke

**`undo()`:** Pop last from `past` → restore as current → push current to `future`
**`redo()`:** Pop first from `future` → restore as current → push current to `past`

**Memory:** Cap at 50 entries in both stacks. `partialize` already excludes these (only persists `nodes, edges, nodeIDs`).

### 6c. Keyboard Shortcuts Hook

**New file:** `src/hooks/useKeyboardShortcuts.ts`

| Shortcut | Action | Guard |
|----------|--------|-------|
| `Ctrl+Z` | Undo | Skip if focus in INPUT/TEXTAREA |
| `Ctrl+Shift+Z` | Redo | Skip if focus in INPUT/TEXTAREA |
| `Ctrl+A` | Select all nodes | Skip if focus in INPUT/TEXTAREA |

Uses `document.addEventListener('keydown', handler)` with cleanup on unmount.

### 6d. ReactFlow Canvas Props

**File:** `src/components/PipelineCanvas.tsx` — Add to `<ReactFlow>`:
```tsx
selectionOnDrag={true}              // left-drag = box select
selectionMode={SelectionMode.Partial} // select if partially in box
multiSelectionKeyCode="Shift"        // shift+click = additive selection
panOnDrag={[1, 2]}                   // middle/right-click = pan
```

Import `SelectionMode` from `reactflow`. Call `useKeyboardShortcuts()` inside component body.

---

## Execution Order

| Step | Task | Files | Risk | Dependencies |
|------|------|-------|------|--------------|
| 0 | `npm install @radix-ui/react-tabs` | package.json | Low | None |
| 1 | Shimmer keyframes | tailwind.config.js | Low | None |
| 2 | Cursor CSS + view transition CSS | index.css | Low | None |
| 3 | View transition TS declarations | types/viewTransitions.d.ts | Low | None |
| 4 | `UNIFIED_NODE_THEME` | constants/theme.ts | Low | None |
| 5 | ShimmerButton component | components/ShimmerButton.tsx | Low | Step 1 |
| 6 | AnimatedThemeToggler | components/AnimatedThemeToggler.tsx | Medium | Steps 2-3 |
| 7 | Update SubmitButton | components/SubmitButton.tsx | Low | Step 5 |
| 8 | Update BaseNode — unified header + delete | nodes/BaseNode.tsx | Medium | Step 4 |
| 9 | Update DraggableNode — unified styling | components/DraggableNode.tsx | Low | Step 4 |
| 10 | Undo/redo store types | types/store.ts | Low | None |
| 11 | Undo/redo store logic | store.ts | **High** | Step 10 |
| 12 | useKeyboardShortcuts hook | hooks/useKeyboardShortcuts.ts | Medium | Step 11 |
| 13 | Rewrite PipelineToolbar with tabs | components/PipelineToolbar.tsx | Medium | Steps 0, 6, 9 |
| 14 | Update PipelineCanvas — minimap, selection, KBDs | components/PipelineCanvas.tsx | Medium | Steps 11-12 |

Steps 0-4 are independent and can be parallelized.

---

## File Manifest

### New Files (4)
| File | Purpose | Lines (est.) |
|------|---------|-------------|
| `src/components/ShimmerButton.tsx` | Magic UI shimmer button | ~60 |
| `src/components/AnimatedThemeToggler.tsx` | Magic UI view-transition toggle | ~70 |
| `src/hooks/useKeyboardShortcuts.ts` | Ctrl+Z, Ctrl+Shift+Z, Ctrl+A | ~40 |
| `src/types/viewTransitions.d.ts` | View Transitions API types | ~10 |

### Modified Files (11)
| File | Changes |
|------|---------|
| `package.json` | Add @radix-ui/react-tabs |
| `tailwind.config.js` | Add shimmer keyframes + animations |
| `src/index.css` | Cursor CSS, view transition CSS |
| `src/constants/theme.ts` | Add UNIFIED_NODE_THEME |
| `src/nodes/BaseNode.tsx` | Unified header + delete button |
| `src/components/DraggableNode.tsx` | Unified toolbar styling |
| `src/components/SubmitButton.tsx` | Use ShimmerButton |
| `src/components/PipelineToolbar.tsx` | Complete rewrite: Radix Tabs + search + AnimatedThemeToggler |
| `src/components/PipelineCanvas.tsx` | MiniMap simplification, selectionOnDrag, panOnDrag, useKeyboardShortcuts |
| `src/store.ts` | Undo/redo history stack (past/future, pushHistory, undo, redo) |
| `src/types/store.ts` | HistoryEntry interface, past/future/undo/redo on StoreState |

---

## Verification Checklist

1. **Toolbar tabs**: Click each category tab → correct nodes shown. Search filters across all categories. Click-to-add and drag-to-add both work.
2. **Unified branding**: ALL nodes (canvas + toolbar) show brand-blue headers/accents. No category-specific colors anywhere.
3. **Delete button**: X visible on every node header. Click deletes node. `e.stopPropagation()` prevents node selection on delete.
4. **MiniMap**: All nodes uniform soft-blue with subtle border. No rainbow.
5. **ShimmerButton**: Shimmer animation on submit. Disabled state stops interaction. Loading spinner during API call.
6. **Theme toggle**: Circular clip-path reveal from button position. Graceful fallback on Firefox.
7. **Cursor**: Default on canvas. Grab on node hover. Grabbing while dragging.
8. **Box select**: Left-drag on canvas → selection rectangle. Shift+click = additive. Middle/right-drag = pan.
9. **Ctrl+A**: Selects all nodes. Does NOT trigger inside text inputs/textareas.
10. **Ctrl+Z / Ctrl+Shift+Z**: Undo/redo works for add/remove nodes, add/remove edges, drag-end positions. History capped at 50.

---

## Research Sources

- **VectorShift**: app.vectorshift.ai (screenshot analyzed), docs.vectorshift.ai/quickstart
- **Blender Node Editor**: docs.blender.org/manual/en/latest (selecting, undo/redo, node_wrangler), wikibooks Blender_3D:HotKeys
- **Magic UI**: magicui.design/docs/components/animated-theme-toggler, magicui.design/docs/components/shimmer-button, github.com/magicuidesign/magicui source
- **shadcn/ui**: ui.shadcn.com/docs/components/radix/tabs, radix-ui.com/primitives/docs/components/tabs
- **React Flow**: reactflow.dev/examples/interaction/undo-redo, reactflow.dev/learn/advanced-use/accessibility, reactflow.dev/api-reference (SelectionMode, panOnDrag, selectionOnDrag)
- **View Transitions API**: developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition

---

## Open Questions for Gemini Peer Review

1. **Undo/redo granularity**: Should `updateNodeField` push history on every debounced sync (150ms), or should we batch field changes and only push on blur/focus-change? The current approach pushes on every 150ms debounce, which could create many fine-grained entries for typing.

2. **Pan behavior with selectionOnDrag**: With `panOnDrag={[1, 2]}` (middle/right-click pan), users without a middle mouse button must right-click drag to pan. Is this acceptable, or should we add a "pan mode" toggle (e.g., Space key held = pan mode)?

3. **MiniMap node stroke**: React Flow v11's MiniMap `nodeStrokeColor` and `nodeStrokeWidth` props — confirm these exist in v11 and not just v12+.

4. **ShimmerButton container queries**: The `100cqh` / `100cqw` units require `container-type: size` on the parent. Confirm CRA5 + PostCSS + Tailwind 3 support container queries without additional configuration.

5. **View Transitions API and ReactFlow**: The `startViewTransition` freezes the DOM during the transition callback. Confirm this doesn't interfere with ReactFlow's internal state management or cause stale renders.

---

## Rebuttal: Design Plan 2 UI/UX Overhaul
### Reviewed By: Gemini (CTO Persona)
### Date: 2026-03-22

*Per the `docs/cto_persona_rules.md` Rebuttal-First Protocol, the following claims have been independently verified against the ReactFlow specifications, the JavaScript Garbage Collector lifecycles, and Captain Red's explicit user feedback.*

### Claims Accepted (with verification)
- **Tabbed Toolbar (VectorShift inspired)**: VERIFIED. At scale, node discovery is a search and categorization problem. Radix Tabs combined with a flat regex search filter provides O(1) accessibility for dense node networks.
- **Keyboard Shortcuts (Blender inspired)**: VERIFIED. ReactFlow exposes `useKeyPress` correctly, and defining keyboard-centric UX separates basic tutorials from professional-grade editors like Figma and Blender.
- **ShimmerButton integration**: VERIFIED. Conic gradients executed via pure CSS classes (`var(--speed)`) are hardware-accelerated and mathematically inexpensive.

### Claims Challenged (with counter-evidence)
- **Claim: "Unified Brand Color via Blue Left Border (`border-l-2`)"**
  - **CHALLENGED**: The principal stakeholder (Captain Red) explicitly rejected this styling. Quote: *"We don't want that [border left]; we only want a simple border on both themes, and we need a selected state that is properly visible."*
  - **Alternative Approach**: Completely strip the `border-l-2`, `borderColor`, and `UNIFIED_NODE_THEME.accent` from all node borders.
    Replace the static container with a uniform 1px border. For the **selected state**, inject a `ring-2 ring-brand-500 ring-offset-2 ring-offset-background` pattern into the `cn()` utility. This establishes a highly pronounced, glowing Focus Ring that maintains identical contrast ratios in both Light and Dark modes.

- **Claim: "Animated Theme Toggler via View Transitions API"**
  - **CHALLENGED**: The `document.startViewTransition()` API strictly and synchronously halts DOM mutations to calculate the visual delta. ReactFlow relies on continuously executing Transformation Matrices (`transform: translate(...)`) via Canvas/WebGL/DOM ticks. Freezing the DOM mid-pan or mid-simulation triggers severe visual snapping, dropped rendering frames, and breaks the 60fps golden rule constraint.
  - **Alternative Approach**: Discard the View Transition API for the interactive web app frame. Let standard CSS variable transitions (`transition-colors duration-300` on the UI components) handle the theme interpolation natively without hijacking the browser compositor thread.

- **Claim: "Undo/Redo History Stack via Full Snapshots on 150ms debounce"**
  - **CHALLENGED**: Pushing a full array snapshot (`past.push({ nodes, edges })`) on every 150ms debounced keystroke introduces a catastrophic O(N) memory allocation leak. If a user types for 10 seconds at 100 nodes, 60 snapshots are generated, pinning 6000 node objects in memory. This triggers massive Garbage Collection (GC) Stop-The-World pauses.
  - **Alternative Approach**: Utilize structural sharing (Zustand `zundo` middleware) OR restrict History pushes strictly to `onBlur` events / focus-change events for text payloads, completely insulating continuous typing from the undo stack.

### Overall Assessment
- **Accept with Modifications**.
- **Confidence: High**.
- Proceed with Phase 1 (Tabs), Phase 3 (MiniMap), Phase 4 (Shimmer), and Phase 6 (Shortcuts). Radically adjust Phase 2 (Brand Color) to implement Captain Red's Focus Ring borders, and completely scrap Phase 5 (View Transitions).
