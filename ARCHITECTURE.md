# Architecture Document

## Project Overview

A visual pipeline builder for AI workflows, built with **React 18 + ReactFlow 11** (frontend) and **Python FastAPI** (backend). Users drag-and-drop nodes onto a canvas, connect them via edges, and submit the pipeline for DAG validation.

---

## Architecture Decisions

### 1. Node Abstraction: Config-Driven Factory Pattern

**Problem:** The original codebase had 4 node files (Input, Output, LLM, Text) with duplicated boilerplate — identical wrappers, inline styles, local state patterns. Adding a new node required touching 4 files.

**Approach:** Each node is defined as a plain JavaScript config object (~20 lines). A shared `BaseNode` component reads the config and renders handles, fields, header, and category styling automatically.

```
configs/inputNode.config.js  →  { type, label, icon, category, handles[], fields[] }
                                           ↓
                              registry.js → createNodeComponent(config)
                                           ↓
                              memo(BaseNode)  ← shared renderer
```

**Why config-driven over alternatives:**

| Pattern | Rejected Because |
|---------|-----------------|
| HOC (Higher-Order Component) | Wrapper indirection, poor DevTools names |
| Render Props | Verbose, each node still writes boilerplate |
| Children Composition | Each node still handles store, handles, styling manually |

**Escape hatch:** Nodes needing custom rendering (Text, LLM) use the `renderContent` property, which accepts a React component instead of auto-generating fields. This keeps the abstraction flexible without becoming a straitjacket.

**Result:** Adding a new node = 1 config file + 1 line in registry. The 5 new nodes (Note, API Request, Conditional, Timer, Merge) each demonstrate a different abstraction capability.

### 2. State Management: Local State + Debounced Store Sync

**Problem:** The original code used `useState` inside each node but never called `updateNodeField` — meaning node data was invisible at submit time.

**Approach:** `BaseNode` maintains local state for immediate responsiveness (controlled inputs), and debounces store sync at 150ms via `updateNodeField`. This prevents keystroke-level re-renders of the entire ReactFlow canvas while keeping the store current for submission.

**Why not pure Zustand binding:** Reading field values directly from the store via selectors creates new object references on every store update, causing ALL nodes to re-render on every keystroke. Confirmed via Zustand GitHub Discussion #2642.

**Why not uncontrolled inputs:** `defaultValue` is never updated by React after mount. When ReactFlow re-renders nodes (viewport pan, selection change), uncontrolled inputs show stale values.

### 3. Styling: Tailwind CSS + Native HTML Controls Inside Nodes

**Why Tailwind over CSS Modules:** CRA 5 (react-scripts 5.0.1) supports Tailwind natively via PostCSS 8. Tailwind gives utility-first styling with zero-config setup.

**Critical decision — native `<select>` inside nodes:** We use native HTML `<select>` elements (styled with Tailwind) for dropdowns inside ReactFlow nodes, NOT shadcn/Radix Select. Reason: Radix UI Select renders its dropdown via a React Portal at `document.body`. ReactFlow's viewport uses CSS `transform: translate() scale()` for pan/zoom. Portals ignore these transforms, causing dropdown menus to position at incorrect screen coordinates.

### 4. DAG Detection: Kahn's Algorithm

**Algorithm:** BFS-based topological sort using `collections.deque`.

**Time complexity:** O(V + E) where V = nodes, E = edges.
**Space complexity:** O(V + E) for adjacency list and in-degree map.

**Why Kahn's over DFS cycle detection:**
- Iterative (no recursion stack overflow risk for large graphs)
- Clean termination check: `processed_count == total_nodes` → DAG; otherwise cycle exists
- `collections.deque` provides O(1) `popleft()` vs `list.pop(0)` which is O(n)

```python
def is_dag(nodes, edges):
    # Build adjacency list and in-degree counts
    # Initialize queue with nodes having in-degree 0
    # BFS: process each node, decrement neighbors' in-degree
    # If processed == total → DAG; else → cycle exists
    return processed == len(node_ids)
```

### 5. Connection Validation: O(1) Frontend + O(V+E) Backend

**Frontend (`isValidConnection`):** Two O(1) checks per connection attempt:
1. Block self-loops (`source === target`)
2. Block duplicate edges to same target handle

**Backend (Kahn's):** Full DAG validation at submit time.

**Why no frontend cycle detection:** Running O(V+E) graph traversal on every mousemove event during edge dragging would degrade framerate. The backend is the authoritative DAG validator.

---

## Bugs Found & Fixed in Original Codebase

### Bug 1: Zustand Missing from package.json
**Location:** `frontend/package.json`
**Issue:** `zustand` was imported in `store.js` but not declared as a dependency. It existed only as a transitive dep of ReactFlow.
**Fix:** Added `zustand@4` explicitly. Critical: must be v4, not v5 — ReactFlow 11.8.3 uses Zustand v4 internally. Installing v5 causes two incompatible store instances, resulting in "Maximum update depth exceeded" infinite re-render loops.

### Bug 2: Nodes Never Synced State to Store
**Location:** All original node files (`inputNode.js`, `outputNode.js`, `textNode.js`)
**Issue:** Every node used local `useState` but never called `updateNodeField`. When the pipeline was submitted, `node.data` was empty — the backend received no field values.
**Fix:** `BaseNode` calls `updateNodeField` via debounced sync on every field change.

### Bug 3: `updateNodeField` Immutability Violation
**Location:** `frontend/src/store.js`, line 46-47
**Issue:** Original code mutated `node.data` in place: `node.data = { ...node.data, [fieldName]: fieldValue }`. This modified the existing node reference without creating a new node object. React's reconciliation couldn't detect the change.
**Fix:** Spread both the node AND data: `{ ...node, data: { ...node.data, [fieldName]: fieldValue } }`.

### Bug 4: Backend GET Endpoint with Form Body
**Location:** `backend/main.py`
**Issue:** `@app.get('/pipelines/parse')` used `Form(...)` parameter. GET requests cannot have form bodies per HTTP specification.
**Fix:** Changed to `@app.post('/pipelines/parse')` with a Pydantic `Pipeline` model accepting JSON body.

### Bug 5: CSS Width Typo
**Location:** `frontend/src/ui.js`, line 93
**Issue:** `width: '100wv'` — invalid CSS unit.
**Fix:** Changed to `'100vw'` (viewport width). Later replaced with `flex-1` for responsive layout.

### Bug 6: Dangling Edges on Handle Removal
**Location:** ReactFlow internal behavior (confirmed via source code lines 3420-3447)
**Issue:** When dynamic handles are removed from the Text node (user deletes a `{{ variable }}`), ReactFlow does NOT auto-delete edges connected to those handles. The edge renders as `null` (hidden) but remains in state, corrupting the graph data sent to the backend.
**Reference:** ReactFlow GitHub Issue #2339
**Fix:** Added `useEffect` in `TextNodeContent` that detects edges pointing to removed handles and calls `onEdgesChange` with `type: 'remove'`.

### Bug 7: Zustand v5 vs v4 Version Mismatch
**Discovery:** After installing `zustand` without version pinning, npm pulled v5.0.12. ReactFlow 11.8.3 bundles v4.5.7 internally. Two incompatible Zustand versions created separate store instances — the app store and ReactFlow's internal store couldn't communicate.
**Symptom:** "Maximum update depth exceeded" infinite re-render loop at `StoreUpdater` component.
**Fix:** Pinned `zustand@4` to match ReactFlow's peer dependency. Verified with `npm ls zustand` — single deduped version.

---

## Text Node: Dynamic Sizing & Variable Detection

### Bidirectional Auto-Sizing

**Technique:** Measure `textarea.scrollHeight` on every text change.

**Critical DOM quirk:** `scrollHeight` never shrinks below the element's current CSS height. To enable shrinking, you must reset `textarea.style.height = 'auto'` before reading `scrollHeight`. This forces the browser to recalculate the natural content height.

```javascript
textareaRef.current.style.height = 'auto';     // Reset → enables shrinking
const scrollH = textareaRef.current.scrollHeight; // True content height
textareaRef.current.style.height = `${scrollH}px`; // Apply
```

### Variable Detection

**Regex:** `/\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g`

Matches valid ECMAScript identifiers inside double curly brackets:
- `{{ name }}` → handle "name" ✓
- `{{ _valid }}` → handle "_valid" ✓
- `{{ $var }}` → handle "$var" ✓
- `{{ 123 }}` → rejected (starts with digit) ✗
- `{{ foo bar }}` → rejected (contains space) ✗

**Deduplication:** `[...new Set(matches.map(m => m[1]))]` — duplicate variables produce only one handle.

### Handle Positioning: Linear Anchoring

**Why not percentage-based:** The formula `top: ((idx+1)*100)/(count+1)%` redistributes ALL handle positions when a new variable is added. Every existing connected edge jumps visually.

**Linear anchoring:** `top: 40px + idx * 28px` — fixed pixel offsets. When a new variable is added, existing handles stay in place. Only the node height expands.

### Debounced updateNodeInternals

`useUpdateNodeInternals(id)` is called after a 150ms debounce when the variables array changes. This hook tells ReactFlow to recalculate handle positions — required because ReactFlow caches handle bounds internally.

---

## File Structure

```
frontend/src/
├── App.js                          # Root: Toolbar + Canvas + Submit + Toaster
├── CustomEdge.jsx                  # Edge with delete button
├── ui.js                           # ReactFlow canvas, drag-drop, isValidConnection
├── toolbar.js                      # Auto-generated from node registry
├── draggableNode.js                # Draggable toolbar buttons with category colors
├── submit.js                       # POST to backend, Sonner toast notification
├── store.js                        # Zustand store (nodes, edges, actions)
├── index.css                       # Tailwind directives + base styles
├── components/
│   └── NodeDropdown.jsx            # Reusable node reference dropdown
├── hooks/
│   └── useNodeDropdown.js          # Shared dropdown logic for {{ }} variable references
├── lib/
│   └── utils.js                    # cn() utility (clsx + tailwind-merge)
└── nodes/
    ├── BaseNode.jsx                # Shared memoized node renderer
    ├── FieldRenderer.jsx           # Routes field.type → field component
    ├── TextNodeContent.jsx         # Custom: dynamic sizing + variable handles
    ├── LLMNodeContent.jsx          # Custom: system/prompt textareas + model dropdown
    ├── registry.js                 # nodeTypes + nodeConfigs (module-level constants)
    ├── configs/                    # 9 declarative node configurations
    │   ├── inputNode.config.js
    │   ├── outputNode.config.js
    │   ├── llmNode.config.js
    │   ├── textNode.config.js
    │   ├── noteNode.config.js
    │   ├── apiRequestNode.config.js
    │   ├── conditionalNode.config.js
    │   ├── timerNode.config.js
    │   └── mergeNode.config.js
    └── fields/                     # Reusable field components
        ├── TextField.jsx
        ├── SelectField.jsx
        ├── TextAreaField.jsx
        ├── SliderField.jsx
        └── VariableTextField.jsx   # With {{ }} node reference dropdown

backend/
└── main.py                         # FastAPI: CORS, Pydantic model, Kahn's DAG algorithm
```

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI framework |
| ReactFlow | 11.8.3 | Node-based graph editor |
| Zustand | 4.5.7 | Lightweight state management |
| Tailwind CSS | 3.x | Utility-first styling |
| Lucide React | Latest | Tree-shakeable icon library |
| Sonner | Latest | Toast notifications |
| FastAPI | Latest | Python backend framework |
| Pydantic | Latest | Request/response validation |
