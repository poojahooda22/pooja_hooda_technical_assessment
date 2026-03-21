# VectorShift Pipeline Builder

A visual drag-and-drop pipeline editor for AI workflows, built as part of the VectorShift Frontend Technical Assessment.

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm start
```
Opens at `http://localhost:3000`

### Backend
```bash
cd backend
pip install fastapi uvicorn pydantic
uvicorn main:app --reload
```
Runs at `http://localhost:8000`

---

## Features

### Part 1: Node Abstraction
- **Config-driven architecture** — each node is defined as a ~20-line config object
- **Adding a new node** = 1 config file + 1 line in registry
- **9 node types** with category-based color coding:

| Node | Category | Purpose |
|------|----------|---------|
| Input | I/O | Pipeline data input |
| Output | I/O | Pipeline data output with `{{ }}` variable references |
| LLM | AI | System instructions, prompt, model selection |
| Text | Transform | Text with dynamic `{{ variable }}` handles |
| Note | Utility | Annotation-only (no connections) |
| API Request | Integration | HTTP method, URL, headers |
| Conditional | Logic | Branching with true/false outputs |
| Timer | Utility | Configurable delay with slider |
| Merge | Transform | 3-input merge with strategy selection |

### Part 2: Styling
- **VectorShift-inspired light theme** with Tailwind CSS
- Category-colored nodes (blue for I/O, purple for AI, green for transforms, etc.)
- Lucide React icons for visual node identification
- Custom edge component with delete button
- Responsive canvas that fills available viewport

### Part 3: Text Node Logic
- **Bidirectional auto-sizing** — node grows and shrinks as text is entered/deleted
- **Variable detection** — typing `{{ variableName }}` creates a handle on the left side
- **Linear handle anchoring** — new handles don't shift existing connections
- **Dangling edge cleanup** — removing a variable automatically removes connected edges
- **Node reference dropdown** — typing `{{` shows available nodes to reference

### Part 4: Backend Integration
- **POST /pipelines/parse** — receives nodes and edges as JSON
- **Kahn's algorithm** (O(V+E)) for DAG cycle detection
- **Response:** `{ num_nodes, num_edges, is_dag }`
- **Sonner toast** notification displays results
- **Frontend validation** blocks self-loops and duplicate connections

---

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed decisions, bug fixes, and technical analysis.

**Key design decisions:**
- Config-driven node factory with `renderContent` escape hatch
- Local state + debounced Zustand store sync (prevents re-render cascades)
- Native `<select>` inside nodes (avoids Radix Portal positioning bugs with ReactFlow transforms)
- Kahn's algorithm with `collections.deque` for O(1) queue operations

**Bugs found and fixed in original codebase:**
1. Zustand missing from package.json (v4 vs v5 version mismatch)
2. Nodes never synced state to store (`updateNodeField` never called)
3. `updateNodeField` immutability violation (mutated node reference in place)
4. Backend used GET with Form body (HTTP spec violation)
5. CSS width typo (`100wv` → `100vw`)
6. Dangling edges on handle removal (ReactFlow Issue #2339)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, ReactFlow 11, Zustand 4, Tailwind CSS 3 |
| Icons | Lucide React |
| Notifications | Sonner |
| Backend | Python FastAPI, Pydantic |
| DAG Algorithm | Kahn's topological sort — O(V+E) |

---

## Project Structure

```
├── frontend/src/
│   ├── nodes/
│   │   ├── BaseNode.jsx           # Shared memoized renderer
│   │   ├── TextNodeContent.jsx    # Dynamic sizing + variable handles
│   │   ├── LLMNodeContent.jsx     # System/prompt/model fields
│   │   ├── registry.js            # Node type registration
│   │   ├── configs/               # 9 declarative node configs
│   │   └── fields/                # Reusable field components
│   ├── hooks/useNodeDropdown.js   # {{ }} variable reference logic
│   ├── components/NodeDropdown.jsx
│   ├── CustomEdge.jsx             # Edge with delete button
│   ├── ui.js                      # ReactFlow canvas
│   ├── toolbar.js                 # Auto-generated from registry
│   ├── submit.js                  # Backend integration + toast
│   └── store.js                   # Zustand state management
├── backend/
│   └── main.py                    # FastAPI + Kahn's DAG algorithm
└── ARCHITECTURE.md                # Detailed technical decisions
```
