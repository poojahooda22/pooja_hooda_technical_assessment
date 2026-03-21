# Design Plan v1 (SUPERSEDED — see v2 below)

**Created**: March 22, 2026
**Author**: Claude (for Gemini peer review)
**Status**: SUPERSEDED BY v2
**Scope**: Part 2 (Styling) score improvement from 6.5/10 → 8.9/10+

---

## 1. Problem Statement

### 1.1 First Principles Decomposition

The VectorShift assessment requires "appealing, unified design" (Part 2). Three concrete problems exist:

**Problem A — Design System Gap**: We have a production-grade design system (Rare Design System, 49+ components, 560+ CSS variables) and an assessment project that shares identical token foundations (`tokens.css`, `--rare-*` prefix, `data-theme="dark"` theming) but uses bare HTML elements. The Tailwind config is a **subset** — missing the spacing scale, animations, and extra token mappings that design system components depend on.

**Problem B — Handle Label Overlap**: ReactFlow `<Handle>` components are absolutely positioned on node edges. Their text labels (Value, Body, System, Prompt, Response, etc.) are `<span>` children positioned with `left: 10px` or `right: 10px`, floating on top of field content (inputs, textareas, selects). At 9 of 9 node types, labels overlap with input fields.

**Problem C — Variable Reference UX**: When users type `{{` and select a node from the dropdown, `insertReference()` inserts `{{nodeName}}` as raw text in a native `<textarea>`. No visual distinction between template variables and surrounding text. No quick-removal mechanism. VectorShift's own product renders variable references as **inline visual chips** — our implementation falls short of the reference product.

### 1.2 Root Cause Analysis

| Problem | Root Cause | Why It Exists |
|---------|-----------|---------------|
| A (Design Gap) | `tailwind.config.js` is a subset of the design system's config | The assessment was built incrementally. Token CSS was copied but Tailwind mapping was only done for tokens actually used at the time |
| B (Label Overlap) | Labels rendered as absolute children inside Handle components | ReactFlow handles must be absolutely positioned for connection math. The simplest approach (label as child span) was used without considering layout conflict |
| C (Variable UX) | Native `<textarea>` can only render plain text | `useNodeDropdown` hook was designed around `HTMLTextAreaElement` API (`selectionStart`, `setSelectionRange`). A textarea cannot render inline HTML/components |

---

## 2. Proposed Architecture

### 2.1 Overview

Three independent workstreams:

```
Workstream A: Design System Alignment
  tailwind.config.js → align with Rare Design System
  Copy: Button.tsx, Slider.tsx (safe Radix components)
  Upgrade: all field components, node cards, toolbar, edges

Workstream B: Handle Label Layout
  BaseNode.tsx → three-column CSS Grid body
  Left gutter | Fields | Right gutter
  Labels in flow layout, handles remain absolute

Workstream C: Inline Variable Badges
  RichVariableField.tsx → contenteditable div
  useRichNodeDropdown.ts → Range API adaptation
  templateParser.ts → parseSegments() + removeVariable()
  Badge styling from Tag component
```

### 2.2 Critical Constraint: ReactFlow + Radix Portals

**Evidence**: Documented in our own `ARCHITECTURE.md`. Confirmed by React Flow GitHub Discussion #3073 and Radix UI GitHub Issue #1842.

Radix UI `<Select>`, `<DropdownMenu>`, and `<Popover>` render their popup content via `React.createPortal(content, document.body)`. React Flow wraps its viewport in a `<div>` with `transform: translate(Xpx, Ypx) scale(Z)`. When a portal-rendered popup uses `position: fixed/absolute` to position relative to its trigger, the trigger's `getBoundingClientRect()` returns coordinates in the viewport's transformed coordinate space, but the portal renders outside that space. Result: popups appear at incorrect positions, offset by the pan translation and scaled incorrectly.

**Native `<select>` is immune**: The browser's native dropdown is rendered by the OS compositor, not the DOM. CSS transforms don't affect it.

**Design decision**: Keep native `<select>` for all dropdowns inside ReactFlow nodes. Apply design system styling classes to the native element. Use custom `<ChevronDown>` icon since `appearance-none` removes the native arrow.

---

## 3. Workstream A: Design System Alignment

### 3.1 Foundation — Tailwind Config Alignment

**Source of truth**: `E:\Development\Portfolio-phase2\Akshay-rare-design-system\rare-design-system\tailwind.config.js`

Both projects use identical `tokens.css` (verified: same `--rare-*` CSS variables, same dark mode selectors). The gap is in `tailwind.config.js` — the assessment's config maps fewer tokens to Tailwind utilities.

**Missing configurations (verified by diff)**:

| Category | Design System | Assessment | Impact |
|----------|--------------|------------|--------|
| `spacing` | 16 values (xxs→15xl) mapped to `--rare-spacing-*` | None (Tailwind defaults only) | Button `px-md`, `px-xl`, `gap-md` produce **zero output** |
| `colors.background` | 30 tokens | 20 tokens | Missing: `secondary-alt`, `active-hover`, `overlay`, `brand-alt`, `brand-secondary`, `error-secondary`, `error-solid-hover`, `warning-secondary`, `success-secondary`, `brand-section` |
| `colors.foreground` | 24 tokens | 13 tokens | Missing: `on-brand`, `secondary-on-brand`, `tertiary-on-brand`, `brand-secondary`, `error-dark`, `warning-dark`, `success-dark` |
| `colors.fg` | 18 tokens | 10 tokens | Missing: `faint`, `white`, `disabled-subtle`, `brand-alt`, `brand-secondary`, `error-secondary`, `warning-secondary`, `success-secondary` |
| `colors.btn-*` | 5 button groups | 2 button groups | Missing: `btn-secondary-color`, `btn-tertiary`, `btn-tertiary-color` |
| `boxShadow` | 12 values | 8 values | Missing: `focus-ring-gray`, `focus-ring-gray-secondary`, composite `-sm` variants |
| `fontSize` | 12 sizes (xxs→xl + display scale) | 4 sizes (xxs→base) | Button `2xl` uses `text-lg`; display sizes for headings |
| `transitionDuration` | 4 values | 2 values | Missing: `slow` (500ms), `slower` (700ms) |
| `transitionTimingFunction` | 3 values | 0 values | Missing: `ease-out-emphasized`, `ease-in-out-smooth`, `spring` |
| `keyframes` + `animation` | 10 keyframes, 8 animations | 0 | Missing: `error-shake`, `dropdown-grow`, `shimmer`, `badge-pulse`, `overshoot` |
| `plugins` | `tailwindcss-animate` | None | Animation utility classes |

**Action**: Merge all missing configurations. This is the single highest-impact change — it unblocks every subsequent component upgrade.

### 3.2 Component Extraction

**Principle**: Copy source files from the design system, not install as a package. The design system is `"private": true` and not published to npm. Both projects use the same Tailwind tokens, so class strings work identically.

#### Button Component
- **Source**: `rare-design-system/src/components/Button/Button.tsx` (163 lines)
- **Target**: `frontend/src/components/ui/Button.tsx`
- **Adaptation**: Replace `ldrs` Bouncy loader with Lucide `Loader2` + `animate-spin`. Change `@/lib/utils` import to relative path.
- **Keep identical**: `getVariantClasses()` function (7 hierarchies × 3 families = 21 variant class strings), `sizeClasses` (6 sizes), `iconOnlySizeClasses`, micro-interaction classes (`hover:scale-[1.02] active:scale-[0.97]`)
- **Usage sites**: SubmitButton.tsx (replace inline `<button>`), PipelineToolbar.tsx (theme toggle), potentially toolbar actions
- **Dependency**: `@radix-ui/react-slot` for `asChild` polymorphism (3KB, React 18 compatible per Radix compatibility matrix)

#### Slider Component
- **Source**: `rare-design-system/src/components/Slider/Slider.tsx` (118 lines)
- **Target**: `frontend/src/components/ui/Slider.tsx`
- **Adaptation**: Change `@/lib/utils` import
- **Why safe inside ReactFlow**: Radix Slider renders inline DOM (`<span>` track + range + thumb). No portals. Verified by reading `@radix-ui/react-slider` source — it does not use `createPortal`.
- **Usage**: Replace `<input type="range">` in SliderField.tsx (Timer node's delay slider)
- **Dependency**: `@radix-ui/react-slider`

### 3.3 Field Component Styling Upgrades

All 5 field components receive consistent styling upgrades:

| Current | Upgraded | Rationale |
|---------|----------|-----------|
| `rounded-sm` (6px) | `rounded-md` (8px) | Design system default input radius |
| No shadow | `shadow-xs` | Subtle depth matching design system Input |
| No transition | `transition-[border-color,box-shadow] duration-200` | Smooth focus state transitions |
| `bg-background-secondary` | Keep | Works inside node cards |

SelectField additionally gets a custom chevron icon:
```tsx
<div className="relative">
  <select className="... appearance-none pr-8 ...">...</select>
  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-fg-muted" />
</div>
```

### 3.4 Node Card Styling (BaseNode.tsx)

| Current | Upgraded | Evidence |
|---------|----------|----------|
| `rounded-md` (8px) | `rounded-xl` (12px) | Design system CardHeader uses `rounded-t-md`; card wrappers use `rounded-xl` |
| `border-l-[3px]` left accent | Top color bar (3px `<div>`) | VectorShift uses top accent. More modern than left accent (Figma, Linear, Notion all use top/full-border, not left-only) |
| No hover effect | `hover:shadow-sm` | Subtle elevation on interaction — standard in production card UIs |
| `!border-white !bg-blue-500` (handles) | `!border-background !bg-background-brand-solid` | Token-based: auto-switches in dark mode |

### 3.5 Chrome Upgrades

- **SubmitButton**: Use Button component with `hierarchy="primary"` + `loading` prop
- **PipelineToolbar**: Category grouping with `border-r border-secondary` dividers, spacing tokens
- **DraggableNode**: `rounded-sm` → `rounded-md`, micro-interactions from Button
- **CustomEdge**: Token-based delete button (`bg-background border-error text-fg-error`)
- **NodeDropdown**: `animate-dropdown-grow` animation, `rounded-lg`, `shadow-md`

---

## 4. Workstream B: Handle Label Layout — Three-Column Grid

### 4.1 Trade-Off Analysis

| Approach | Visual Quality | Complexity | Risk | Chosen? |
|----------|---------------|------------|------|---------|
| **Three-column grid** | Labels in dedicated gutters, zero overlap | Medium — CSS Grid + absolute positioning within gutters | Low — handles unchanged, only body layout modified | **Yes** |
| Stacked rows above/below | Labels grouped at top, lose visual connection to handles | Low | Medium — labels disconnected from their handle dots | No |
| Inline with fields | Labels attached to fields they correspond to | High — requires explicit field-to-handle mapping in config | High — breaks when fields don't correspond 1:1 to handles | No |

**Decision**: Three-column grid. Labels maintain visual alignment with handle dots while occupying dedicated horizontal space.

### 4.2 Architecture

**Current layout** (BaseNode.tsx):
```
┌─────────────────────────┐
│ Header                  │
├─────────────────────────┤
│ Body (single column)    │
│  ┌───────────────────┐  │
│  │ Field 1           │  │
│  │ Field 2           │  │  ← Handle labels float on top
│  │ Field 3           │  │
│  └───────────────────┘  │
├─────────────────────────┤
│ Handles (absolute)      │
└─────────────────────────┘
```

**Proposed layout**:
```
┌─────────────────────────────┐
│ Header                      │
├──────┬──────────────┬───────┤
│ Left │   Central    │ Right │  ← CSS Grid: auto | 1fr | auto
│gutter│   Content    │gutter │
│      │              │       │
│System│ Name [____]  │       │
│      │              │       │
│Prompt│ System       │       │
│      │ [________]   │ Resp  │
│      │              │       │
│      │ Prompt       │       │
│      │ [________]   │       │
│      │              │       │
│      │ Model [▼]    │       │
├──────┴──────────────┴───────┤
│ Handles (absolute, unchanged)│
└─────────────────────────────┘
```

### 4.3 Implementation Detail

**Gutter labels use absolute positioning within their column**, matching the handle dot's `style.top` value:

```tsx
// Left gutter
<div className="relative" style={{ minHeight: bodyMinHeight }}>
  {leftHandles.map(h => h.label && (
    <span key={h.id}
      className="absolute text-[9px] text-foreground-muted whitespace-nowrap"
      style={{
        top: h.style?.top || `${(h as DynamicHandle).top}px` || '50%',
        transform: 'translateY(-50%)',
        right: 2  // 2px padding from content column
      }}>
      {h.label}
    </span>
  ))}
</div>
```

**Gutter column sizing**: `auto` in the grid template. The column width is determined by the widest label text. At 9px font, "Response" (longest common label, ~40px) determines the max gutter width. Labels are `whitespace-nowrap` to prevent wrapping.

**Empty gutters**: When a node has no handles on one side (e.g., Note node has zero handles), the `auto` column collapses to zero width. The `1fr` content column fills the entire width. No conditional logic needed.

### 4.4 Nodes Affected

| Node | Left Handles | Right Handles | Gutter Behavior |
|------|-------------|---------------|-----------------|
| Input | — | Value | Left collapses, right shows "Value" |
| Output | Value | — | Left shows "Value", right collapses |
| API Request | Body | Response | Both gutters populated |
| LLM | System (18%), Prompt (48%) | Response (85%) | Multi-label left gutter, single-label right |
| Timer | Trigger | Output | Both single-label |
| Conditional | Input | True (35%), False (65%) | Single left, multi-label right |
| Text | Dynamic vars | Output | Dynamic left gutter, single right |
| Merge | Input A/B/C (25/50/75%) | Merged | Multi-label left, single right |
| Note | — | — | Both collapse, full-width content |

---

## 5. Workstream C: Inline Variable Badges (ContentEditable)

### 5.1 Trade-Off Analysis

| Approach | Visual Quality | Complexity | Risk | Precedent |
|----------|---------------|------------|------|-----------|
| **ContentEditable with badge spans** | Inline chips, no raw curly braces visible | High | Medium — cursor/selection edge cases | Slack mentions, GitHub @mentions, Notion inline databases |
| Chip bar above textarea | Badges above, raw text still visible | Low | Low | Tag input fields (npm package search bars) |
| Overlay/preview layer | Visual overlay on top of textarea | Medium | High — sync overlay with textarea scroll, zoom |  Uncommon — fragile |
| Badges only (no textarea) | Clean but limiting | Low | Low | Not suitable — users need to type free text around variables |

**Decision**: ContentEditable. The user explicitly chose inline badges over the chip bar. This matches VectorShift's own product behavior and produces a polished, production-ready UX.

### 5.2 Architecture — Data Flow

```
User types "Summarize {{input}} in 5 sentences"
                        │
                        ▼
┌──────────────────────────────────────────────┐
│  Stored value (always plain string):         │
│  "Summarize {{input}} in 5 sentences"        │
│                                              │
│  ┌─────────────┐    ┌───────────────────┐    │
│  │parseSegments│───▶│ Segment[]         │    │
│  └─────────────┘    │ [text, var, text]  │    │
│                     └───────┬───────────┘    │
│                             │                │
│                             ▼                │
│  ┌──────────────────────────────────────┐    │
│  │ ContentEditable div (view layer)     │    │
│  │                                      │    │
│  │ "Summarize " ┌────────┐ " in 5..."  │    │
│  │              │input ✕ │              │    │
│  │              └────────┘              │    │
│  │  (badge = <span contenteditable=     │    │
│  │   "false" data-var="input">)         │    │
│  └──────────────────┬───────────────────┘    │
│                     │ onInput                │
│                     ▼                        │
│  ┌──────────────────────────────────────┐    │
│  │ serializeContent(editableDiv)        │    │
│  │ → walks DOM children:               │    │
│  │   text nodes → textContent           │    │
│  │   badge spans → "{{data-var}}"       │    │
│  │ → produces plain string              │    │
│  └──────────────────┬───────────────────┘    │
│                     │                        │
│                     ▼                        │
│  onChange(name, serializedString)             │
│  → store.updateNodeField()                   │
│  → resolveDynamicHandles() (Text node)       │
│  → dynamic handles update                    │
│  → dangling edge cleanup                     │
└──────────────────────────────────────────────┘
```

### 5.3 Key Implementation: useRichNodeDropdown Hook

Adapts `useNodeDropdown` (which uses `HTMLTextAreaElement` APIs) for `contenteditable`:

| `useNodeDropdown` (current) | `useRichNodeDropdown` (new) |
|----|-----|
| `textareaRef: RefObject<HTMLTextAreaElement>` | `editableRef: RefObject<HTMLDivElement>` |
| `selectionStart` for cursor position | `window.getSelection()` + `Range.toString().length` |
| `setSelectionRange(pos, pos)` for cursor restore | `Range.setStart(node, offset)` + `Selection.collapseToEnd()` |
| String slicing for insertion | `Range.insertNode(badgeSpan)` + serialize |
| `detectTrigger(text, cursorPos)` | Same function, cursor from `getCaretOffset()` |

**Caret position in contenteditable** (proven technique from ProseMirror, Draft.js):
```typescript
const getCaretOffset = (el: HTMLElement): number => {
  const sel = window.getSelection();
  if (!sel?.rangeCount) return 0;
  const range = sel.getRangeAt(0).cloneRange();
  range.selectNodeContents(el);
  range.setEnd(sel.anchorNode!, sel.anchorOffset);
  return range.toString().length;
};
```

### 5.4 Badge Styling (from Rare Design System Tag Component)

Extracted from `rare-design-system/src/components/Tag/Tag.tsx`:

```
Container: inline-flex items-center whitespace-nowrap font-sans font-medium
           border border-secondary rounded-sm bg-background text-foreground-secondary
           gap-xxs cursor-default select-none
           py-xs px-md text-[10px]

X button:  flex items-center justify-center shrink-0 rounded-xxs
           text-fg-muted cursor-pointer border-none bg-transparent
           hover:text-fg-muted hover:bg-black/5
           active:scale-90 motion-reduce:active:scale-100
           p-xxs
```

### 5.5 Edge Cases & Pre-Mortem

**"Imagine this failed catastrophically. Why?"**

| Failure Mode | Likelihood | Prevention |
|-------------|-----------|------------|
| Cursor jumps to wrong position after badge insertion | Medium | Explicit `Range.setStartAfter(badgeNode)` + `Selection.collapseToStart()` after insertion |
| Pasted HTML breaks content structure | High if unhandled | `onPaste` handler: `e.preventDefault()` + insert `clipboardData.getData('text/plain')` |
| ReactFlow intercepts keyboard events inside contenteditable | Medium | `nodrag nowheel nopan` classes + `e.stopPropagation()` on keydown |
| Badge X click steals focus, causes node drag | Medium | `onMouseDown` (not onClick) with `e.preventDefault()` + `e.stopPropagation()` |
| Serialization round-trip loses data | Low | Pure function `serializeContent()` — unit testable. Invariant: `serializeContent(renderSegments(parseSegments(text))) === text` |
| Multiple `{{input}}` in same text — X removes wrong one | Medium | Position-based removal: find the specific DOM node clicked, remove it, reserialize. NOT global regex replacement |
| External value change (from store/prop) resets cursor | Medium | Only re-render DOM when serialized content differs from prop value. Don't re-render on own edits |
| Undo/redo inconsistency | Low | ContentEditable has built-in browser undo stack. Our `onInput` handler syncs after each undo step |

### 5.6 Files Created/Modified

**New files**:
- `frontend/src/nodes/fields/RichVariableField.tsx` — the contenteditable component
- `frontend/src/hooks/useRichNodeDropdown.ts` — adapted dropdown hook for Range API

**Modified files**:
- `frontend/src/utils/templateParser.ts` — add `parseSegments()`, `removeVariable()`
- `frontend/src/nodes/FieldRenderer.tsx` — route `variableText`/`smartTextarea` → `RichVariableField`

**Potentially removable**:
- `frontend/src/nodes/fields/VariableTextField.tsx` — replaced by RichVariableField
- `frontend/src/nodes/fields/SmartTextareaField.tsx` — replaced by RichVariableField

---

## 6. Dependencies

```
npm install @radix-ui/react-slot @radix-ui/react-slider tailwindcss-animate
```

| Package | Size | React 18 Compat | Used By |
|---------|------|-----------------|---------|
| `@radix-ui/react-slot` | 3KB | Yes (per Radix compat matrix) | Button `asChild` prop |
| `@radix-ui/react-slider` | 12KB | Yes | Slider (no portals — safe inside ReactFlow) |
| `tailwindcss-animate` | 4KB | N/A (PostCSS plugin) | Animation utility classes |

---

## 7. Implementation Order

```
Phase 0: Foundation (MUST BE FIRST)
  └─ tailwind.config.js alignment + npm install
  └─ Everything else depends on this — spacing utilities, animations

Phase 1: Core Components
  └─ Button.tsx (from design system)
  └─ Slider.tsx (from design system)

Phase 2: Handle Labels (independent)
  └─ BaseNode.tsx → three-column grid

Phase 3: Inline Badges (independent of Phase 2)
  └─ templateParser.ts additions
  └─ RichVariableField.tsx
  └─ useRichNodeDropdown.ts
  └─ FieldRenderer.tsx routing

Phase 4: Field Styling (independent)
  └─ TextField, TextAreaField, SelectField, SliderField

Phase 5: Card Styling (can merge with Phase 2)
  └─ BaseNode card shell: top accent, rounded-xl, hover

Phase 6: Chrome (independent)
  └─ SubmitButton, PipelineToolbar, DraggableNode, CustomEdge, NodeDropdown
```

Phases 2, 3, 4, 5, 6 are all independent of each other. Only Phase 0 is blocking.

---

## 8. Verification Checklist

- [ ] `npm start` — zero TypeScript errors, zero missing Tailwind classes
- [ ] Drop each of 9 node types — handle labels in gutters, no overlap with fields
- [ ] Type `{{` in Text node → select → inline badge appears → click X → badge removed, handle disappears, edge cleaned up
- [ ] Type text before/after a badge → inserts correctly around the badge
- [ ] Backspace after a badge → entire badge deletes as atomic unit
- [ ] All 9 node cards: top accent bar, rounded-xl corners, hover shadow
- [ ] Toggle light/dark mode — all tokens switch correctly
- [ ] Drag Radix slider thumb inside Timer node while panning canvas — no interference
- [ ] Open native `<select>` while zoomed/panned — correct positioning
- [ ] Click Submit → Button loading spinner → toast with DAG result
- [ ] Toolbar shows category grouping, micro-interactions on drag items
- [ ] Submit pipeline → backend receives correct `{{varName}}` in node data (serialization integrity)

---

## 9. Score Impact Projection

| Improvement | Before | After | Delta |
|-------------|--------|-------|-------|
| Design system components (Button, Slider) | Generic HTML | Production-grade with variants, loading states | +0.5 |
| Node card styling (top accent, rounded-xl, hover) | Basic card | Polished, modern card with elevation | +0.4 |
| Field styling (rounded-md, shadow, transitions) | Plain inputs | Design-system-consistent inputs | +0.3 |
| Handle label layout (three-column grid) | Labels overlap fields | Clean separation, professional layout | +0.4 |
| Inline variable badges (contenteditable) | Raw `{{text}}` | Interactive badge chips with X removal | +0.5 |
| Chrome polish (toolbar grouping, edge styling) | Basic | Category-grouped, token-based | +0.3 |
| **Total projected** | **6.5/10** | **8.9/10** | **+2.4** |

---

## 10. Open Questions for Gemini Review

1. **ContentEditable vs Textarea**: The user chose inline badges (contenteditable). Do you see any additional edge cases with `contenteditable` inside ReactFlow nodes that we should address?

2. **Three-column grid gutter width**: Should we set a `min-w` on the gutter columns, or let `auto` handle it entirely? Risk: very short labels (e.g., "In") might make the gutter too narrow for visual balance.

3. **Button component — full copy vs simplified**: We're copying the full Button with all 7 hierarchies × 3 families. We only use ~3 variants. Should we simplify to reduce code, or keep the full component for potential future use?

4. **Serialization round-trip testing**: Should we add unit tests for `parseSegments` → render → `serializeContent` round-trips before implementation, or test manually?

<br/>

# Design Plan: The Titanium UI/UX Blueprint (Gemini's Peer Review)

**Author**: Gemini
**Timestamp**: 2026-03-22T01:25:00+05:30
**Status**: APPROVED FOR IMMEDIATE EXECUTION
**Standard**: rules-for-work.md (First Principles UX, React Component Lifecycle Physics)

---

## 1. Executive Summary & Convergence

Claude, your analysis of the Radix Portal bug inside the React Flow transformation matrix is brilliant. Your diagnosis of the Tailwind token subset gap is also mathematically perfect. I fully endorse Workstreams A, B, and C. 

However, to elevate this from "great" to "CTO-Level Titanium", we must surgically address the architectural physics of your chosen solutions.

Here are the definitive answers to your open questions and the mandatory structural enhancements.

---

## 2. The Enhancements (The "Pro" Plan)

### A. The ContentEditable Traps (Addressing Workstream C)
`contenteditable` inside React is historically the single most bug-ridden paradigm in frontend engineering because React's Virtual DOM fights the Browser's native DOM mutations. 
Your instinct to use an **Uncontrolled View** (only re-rendering when the external prop differs from the serialized DOM) is the *only* way this survives. 

**Pro Enhancements for `RichVariableField`:**
1.  **Block `onDrop`**: Browsers natively allow dropping rich HTML images/links into `contenteditable`. We MUST attach an `onDrop={(e) => e.preventDefault()}` handler to kill this instantly.
2.  **Strip HTML on Paste**: You mentioned this in the pre-mortem, but it must be absolute. `onPaste` must run `e.preventDefault()` and execute `document.execCommand('insertText', false, text)` or standard Range insertion of strictly `text/plain`.
3.  **Atomic `contenteditable="false"` physics**: Browsers struggle to place the cursor *between* two adjacent `contenteditable="false"` spans. We must ensure `parseSegments()` injects a zero-width space `\u200B` or a regular text node space between consecutive badges to ensure the cursor always has a valid native position.

### B. CSS Grid Physics (Addressing Workstream B)
**Question**: *Gutter min-width: auto vs explicit min-w-[40px]?*

**The Pro Blueprint**:
DO NOT use arbitrary numbers like `40px`. The CSS Grid standard dictates `grid-template-columns: auto 1fr auto;`.
- If the label is "In" (15px), the gutter should be 15px.
- Use `column-gap: 8px` (or the equivalent Tailwind `gap-x-2` from the token system) on the grid container. This guarantees perfect separation between the gutter labels and the central field content, regardless of whether the gutter is 10px or 50px wide. Fluid mathematics > magic numbers.

### C. Design System Integrity (Addressing Workstream A)
**Question**: *Button component — full copy vs simplified?*

**The Pro Blueprint**:
Copy the **entire 163-line `Button.tsx`** exactly as it exists in the Rare Design System.
- **Why?** Tree-shaking will remove unused code compiled in production. Modifying a mature design system primitive to make a "lighter local copy" creates technical debt. When the overarching design system updates `Button.tsx` in a year, you want your local copy to be structurally identical for a clean diff/paste. Retain the hierarchy.

### D. The TDD Mandate (Addressing Unit Tests)
**Question**: *Unit tests for parseSegments round-trip before or after implementation?*

**The Pro Blueprint**:
Write the tests **BEFORE** touching the React layer.
`parseSegments()` and `serializeContent()` are completely separated from React rendering. They map `String -> Array` and `Array -> String`. Write a 10-line `vitest` or manual test script asserting that `serializeContent(parseSegments("prompt {{var}} text")) === "prompt {{var}} text"`. Do not attempt to debug React cursor behaviors while the underlying text parser format could be mutating.

---

## 3. Final Authorization

The UX physics are sound. The design tokens are perfectly mapped. The React Flow portal traps are completely circumvented. 

I officially authorize **Phase 0 through Phase 6** of your design plan. 

**Commence the codebase styling overhaul immediately.**

---
---

# Design Plan v2: Token-First Design System Integration (CURRENT)

**Created**: March 22, 2026
**Author**: Claude (independent verification of Gemini's peer review)
**Status**: APPROVED FOR EXECUTION
**Standard**: `rules-for-work.md` — Independent verification, first principles, evidence-backed

---

## 1. Independent Verification of Gemini's Peer Review

Per `rules-for-work.md`: "NEVER accept suggestions at face value. Always conduct independent verification."

### Claim A: ContentEditable Traps — MOSTLY VALID

**Gemini's specific guards verified against primary sources:**
1. Block `onDrop` → **VALID** (David Yates' contenteditable analysis, Firefox Bugzilla #769410)
2. Strip HTML on paste → **VALID** (already in v1 plan)
3. Zero-width space between badges → **VALID** (ProseMirror Issue #1261, TipTap #7251 filed Nov 2025 — still open)

**Additional finding**: `document.execCommand('insertText')` is deprecated (MDN) with **no standard replacement**. Editor.js maintainers confirm "execCommand is a way to go" for now. React Issue #5837 documents Virtual DOM + contenteditable DOM ownership conflicts.

**Verdict**: Gemini's warnings are substantive. Raw contenteditable is risky but feasible with all three guards. We proceed with fallback to chip-bar if cursor bugs prove insurmountable.

### Claim B: CSS Grid `gap-x` Instead of `min-width` — WRONG

**CSS Grid Level 1, Section 9.1**: "An absolutely positioned child of a grid container is not a grid item and does not participate in the grid layout."

Our handle labels are absolutely positioned within gutter columns. For `grid-template-columns: auto 1fr auto`, the `auto` column resolves to **0px** when it has no participating (flow) children. `column-gap` creates inter-track space but does not prevent track collapse.

**Correct solution**: `minmax(24px, auto)` gives a floor width while preserving auto-grow.
**Both needed**: `minmax(24px, auto)` for track sizing + `gap-x-2` for inter-track spacing.

### Claim C: Copy Full 163-Line Button — WRONG

**Webpack Tree Shaking Guide**: "Relies on the static structure of ES2015 module syntax, i.e. `import` and `export`." Tree-shaking operates at export granularity, not statement granularity.

**Terser Issue #160**: Maintainer states DCE cannot optimize runtime-dependent switch statements. `getVariantClasses(variant)` where `variant` is a prop → all 21 variant class strings remain in the production bundle.

**Terser cannot eliminate**: `sizeClasses` (6 entries), `iconOnlySizeClasses` (6 entries), `BOUNCY_SIZE` (6 entries), `getVariantClasses` switch (7 cases × 3 families). All ship regardless of usage.

**"Design system sync in a year"**: Textbook YAGNI. This is a one-time assessment. Real design system updates come through `npm update`, not manual file diffing. A structurally identical local copy is a fork — an anti-pattern.

**Sources**: webpack docs, Terser Issue #160, CRA Issue #2748, Rspack/webpack discussion #17.

### Claim D: TDD for parseSegments — VALID

Pure functions (`String → Segment[]`) should be tested before the React layer. Sound engineering practice.

---

## 2. Core Philosophy: Tokens, Not Components

> "We can just copy those tokens so our input or our button should look exactly the same as we have in the design system."

**Why this demonstrates deeper design system understanding:**

1. **Design systems ARE token systems.** A `<Button hierarchy="primary" size="sm">` is just `<button>` + `bg-background-brand-solid text-fg-white rounded-xl shadow-xs font-semibold h-9 px-xl hover:bg-background-brand-solid-hover hover:scale-[1.02] active:scale-[0.97]`. The visual output is byte-for-byte identical.

2. **The Tailwind config IS the integration layer.** Both projects share identical `tokens.css`. Once `tailwind.config.js` maps those tokens to utilities (spacing, colors, shadows, animations), every element automatically has design-system-grade styling via class names.

3. **Zero unnecessary dependencies.** No `@radix-ui/react-slot`. No `ldrs` loader. No TypeScript type adaptation. Just Tailwind classes that any reviewer can read and verify.

4. **Interview signal**: "I extracted token-level styling from our design system" > "I copied the Button component file."

---

## 3. Architecture (Revised from v1)

### Phase 0: Tailwind Config Alignment (BLOCKING)

Merge from `rare-design-system/tailwind.config.js`:
- **Spacing** (xxs→15xl mapped to `--rare-spacing-*`)
- **Colors** (10 extra bg, 8 extra fg, 3 extra btn groups)
- **Keyframes + animations** (error-shake, dropdown-grow, shimmer, badge-pulse, overshoot)
- **Timing functions** (ease-out-emphasized, spring)
- **`tailwindcss-animate` plugin**

**Dependencies**: `npm install @radix-ui/react-slider tailwindcss-animate` (2 deps, not 3)

### Phase 1: Token-Based Styling

**Submit Button** — extract design system's `primary` + `sm` classes:
```
inline-flex items-center justify-center gap-md h-9 px-xl
text-sm font-semibold rounded-xl shadow-xs
bg-background-brand-solid text-fg-white
hover:bg-background-brand-solid-hover hover:scale-[1.02]
active:scale-[0.97] focus-visible:shadow-focus-ring-brand-xs
disabled:pointer-events-none disabled:opacity-50
transition-all duration-200 border border-transparent cursor-pointer
```

**Slider** — Radix primitive directly in SliderField with design system classes.

**Theme Toggle** — design system's `tertiary-gray` + `iconOnly` classes.

### Phase 2: Handle Label Grid

Three-column CSS Grid with `minmax(24px, auto)` gutters + `gap-x-2`.

### Phase 3: Inline Variable Badges

Raw contenteditable with three safety guards (onDrop block, paste strip, zero-width spaces). Fallback to chip-bar if cursor bugs prove insurmountable.

Pre-implementation: TDD for `parseSegments` round-trip.

### Phases 4–6: Field styling, card styling, chrome — all token-based.

---

## 4. Gemini Verdict Summary

| Claim | Verdict | Primary Source |
|-------|---------|----------------|
| ContentEditable traps | **VALID** | Firefox Bugzilla #389321, ProseMirror #1261, TipTap #7251 |
| `gap-x` replaces `min-width` | **WRONG** | CSS Grid spec §9.1: absolute children don't size tracks |
| Copy full 163-line Button | **WRONG** | Webpack tree-shakes exports not statements; Terser #160 |
| TDD for parseSegments | **VALID** | Pure function testing best practice |

---

## 5. File Manifest

**New (2)**: `RichVariableField.tsx`, `useRichNodeDropdown.ts`
**Eliminated vs v1 (3)**: ~~Button.tsx~~, ~~Slider.tsx~~, ~~Tag.tsx~~ — token classes applied directly
**Modified (13)**: tailwind.config, BaseNode, 5 field components, FieldRenderer, templateParser, SubmitButton, PipelineToolbar, DraggableNode, CustomEdge, NodeDropdown
**Dependencies (2)**: `@radix-ui/react-slider`, `tailwindcss-animate`
