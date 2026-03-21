# Rules for Work — Research, Analysis & Engineering Standards

**Created**: March 11, 2026
**Last Updated**: March 18, 2026
**Purpose**: Establish world-class research, analysis, and engineering standards for every task — peer review, component design, architecture decisions, debugging, research, and implementation. Nothing leaves this project without rigorous, evidence-backed validation.

---

## Guiding Philosophy

> "If you can't explain it simply, you haven't researched it deeply enough."

This project operates at **MIT / Harvard graduate-to-PhD-level research standards**. Every decision, every component, every line of reasoning must be backed by substance — not vibes, not defaults, not "this is how most tutorials do it." We follow what the top teams at Google, Microsoft, Meta, Adobe, and NVIDIA follow. We research like scientists, build like senior engineers, and validate like skeptics.

**NEVER accept suggestions at face value.** Always conduct independent verification through deep research, scientific analysis, and cross-referencing with authoritative sources.

**NEVER produce generic output.** Every deliverable must demonstrate depth of understanding, specificity to our problem, and evidence that alternatives were considered and rejected for stated reasons.

---

## The Non-Negotiables

1. **Substance over speed** — A well-researched answer delivered in 5 minutes beats a shallow answer in 30 seconds. Always.
2. **Evidence over opinion** — Claims require citations. "I think this is better" is not acceptable. "This is better because [source], [benchmark], [specification section]" is.
3. **First principles over cargo cult** — Understand *why* something works, not just *that* it works. Copy-pasting patterns without understanding their constraints is how bugs get born.
4. **Specificity over generality** — "Use memoization" is generic. "Use `useMemo` with a stable dependency array here because this computation runs O(n²) on every render and our profiler shows 12ms wasted per frame at n=500" is specific.
5. **Exhaustive search over satisficing** — Don't stop at the first answer. Search GitHub, Stack Overflow, academic papers, specification docs, senior-level repos, and production codebases. The right answer is often the 4th or 5th one you find.

---

## Research Methodology

### Tier 1: First Principles Analysis

Before researching externally, decompose the problem from axioms:

- **What is the fundamental problem we're solving?** Strip away implementation details. What's the core constraint?
- **What are the physical/mathematical/computational limits?** (e.g., GPU fill rate, network latency floors, algorithmic complexity bounds)
- **What are the trade-offs?** Every design choice sacrifices something. Name the trade-off explicitly.
- **What would a solution look like if we had zero legacy constraints?** Then work backwards to what's practical.

This is how Elon Musk's engineering teams at SpaceX reason, how Google's Jeff Dean approaches systems design, and how Feynman approached physics problems — reduce to fundamentals, then build up.

### Tier 2: Systematic Literature & Source Review

#### Academic & Scientific Sources
- **ACM Digital Library** — Computer science research papers, SIGGRAPH proceedings
- **IEEE Xplore** — Engineering standards, performance studies
- **arXiv** — Preprints on graphics, ML, systems, HCI
- **Google Scholar** — Cross-referencing citations, finding seminal papers
- **SIGGRAPH / Eurographics proceedings** — State-of-the-art rendering, simulation, interaction
- **MIT CSAIL, Stanford Graphics Lab, CMU publications** — Cutting-edge research from top labs

#### Specifications & Standards
- **W3C specifications** — Web standards, CSS, DOM, Web APIs
- **Khronos Group** — WebGL, OpenGL ES, Vulkan specifications
- **ECMA-262** — JavaScript language specification
- **MDN Web Docs** — Authoritative web platform documentation
- **WHATWG** — HTML Living Standard, Fetch, Streams

#### Industry Engineering Blogs & Documentation
- **Google Engineering Blog** — Chrome team, V8, Skia, performance insights
- **Meta Engineering** — React internals, Hermes, performance at scale
- **Microsoft DevBlogs** — TypeScript, VS Code, Edge rendering
- **NVIDIA Developer** — GPU architecture, shader optimization, CUDA patterns
- **Adobe Engineering** — Creative tools, rendering pipelines, color science
- **Vercel Blog** — Next.js internals, edge computing, deployment patterns

#### Senior-Level Open Source Repositories
- **Three.js** — Graphics rendering patterns, WebGL resource management, scene graphs
- **Babylon.js** — Scene architecture, texture pooling, physics integration
- **PixiJS** — 2D rendering optimization, batch systems, sprite management
- **PlayCanvas** — Entity-component systems, memory management, asset pipelines
- **Regl** — Functional WebGL patterns, resource lifecycle, declarative GPU programming
- **Luma.gl** — WebGL2 best practices, GPU resource management
- **React source code** — Fiber architecture, reconciliation, scheduler internals
- **V8 engine source** — JIT compilation, hidden classes, garbage collection
- **Chromium source** — Compositor, layout, paint, raster pipelines

#### Reference Books & Canonical Texts
- **GPU Gems** series (NVIDIA) — Real-time rendering techniques
- **Real-Time Rendering** (Möller, Haines, Hoffman) — The bible of graphics engineering
- **Computer Graphics: Principles and Practice** (Hughes et al.) — Foundational theory
- **JavaScript: The Definitive Guide** (Flanagan) — Language-level precision
- **Designing Data-Intensive Applications** (Kleppmann) — Systems architecture patterns

### Tier 3: Production Codebase & Community Analysis

#### GitHub Deep Search
- Search for production implementations of the pattern/algorithm in question
- Filter by stars, recent activity, and language
- Read the actual implementation code, not just the README
- Check issue trackers for known limitations and edge cases
- Review PRs for the reasoning behind design decisions (PR descriptions, review comments)

#### Stack Overflow / Stack Exchange
- Search for the specific problem, not the general topic
- Read accepted answers AND highly-upvoted alternatives — sometimes the accepted answer is outdated
- Check comment threads for corrections and edge cases
- Note the date — answers older than 2 years may reference deprecated APIs

#### Community & Expert Discourse
- **GitHub Discussions** on relevant repos
- **Discord / Slack communities** for frameworks (React, Three.js, etc.)
- **Twitter/X threads** from core team members and recognized experts
- **Conference talks** (YouTube) from SIGGRAPH, React Conf, Chrome Dev Summit, JSConf
- **Podcasts & newsletters** from domain experts

### Tier 4: Comparative & Competitive Analysis

- **How do the top 3-5 teams in this domain solve this problem?**
  - Google: What does Chrome DevTools / Lighthouse recommend?
  - Meta: How does React handle this internally?
  - Apple: What does WebKit's approach look like?
  - Game studios (Epic, Unity, id Software): What patterns do game engines use?
  - Creative tools (Figma, Canva, Adobe): How do they handle this at scale?

- **What patterns emerge across independent implementations?**
  - If 4 out of 5 major codebases use the same pattern, that's signal
  - If they all avoid a particular approach, understand why

- **What are the failure modes in production?**
  - Search for post-mortems, incident reports, "lessons learned" posts
  - Understand what breaks at scale, under load, on low-end devices

---

## Analysis Frameworks

### First Principles Decomposition
Break every problem into its atomic components. Question every assumption. Rebuild from fundamentals. This is the Feynman method — if you can't derive it from basics, you don't truly understand it.

### Socratic Questioning
For every proposed solution, ask:
1. **What is the evidence for this?** (empirical basis)
2. **What are the assumptions?** (hidden dependencies)
3. **What are the counterarguments?** (steel-man the alternative)
4. **What would change my mind?** (falsifiability)
5. **What are the second-order effects?** (downstream consequences)

### MECE Analysis (Mutually Exclusive, Collectively Exhaustive)
Used by McKinsey, BCG, and top strategy teams. When analyzing options:
- Ensure every option is distinct (no overlap)
- Ensure all options are covered (no gaps)
- This prevents "analysis paralysis" and "we forgot about X" situations

### Root Cause Analysis (5 Whys + Ishikawa)
For debugging and problem diagnosis:
- Ask "why?" at least 5 times to reach the true root cause
- Categorize causes: Method, Machine (environment), Material (data), Man (user), Measurement, Mother Nature (external)
- Never fix symptoms. Fix causes.

### Trade-off Matrix
For every significant decision, create an explicit matrix:
| Criterion | Option A | Option B | Option C |
|-----------|----------|----------|----------|
| Performance | data | data | data |
| Maintainability | data | data | data |
| Complexity | data | data | data |
| Risk | data | data | data |

Weight the criteria by importance. Make the decision transparent and auditable.

### Pre-mortem Analysis
Before implementing, ask: "Imagine this failed catastrophically 6 months from now. Why did it fail?" Then address those risks proactively. This is standard practice at Amazon (Working Backwards) and Google (Design Docs).

---

## Quality Standards for Every Deliverable

### For Research & Analysis
- [ ] Multiple independent sources consulted (minimum 3 for any significant claim)
- [ ] First principles reasoning documented
- [ ] Counterarguments identified and addressed
- [ ] Specific citations provided (not "I read somewhere that...")
- [ ] Trade-offs explicitly stated
- [ ] Confidence level declared (high / medium / low, with reasoning)

### For Code & Implementation
- [ ] Researched how senior-level codebases handle this pattern
- [ ] Performance characteristics understood and documented
- [ ] Edge cases identified through systematic analysis
- [ ] No cargo-cult code (every line has a reason)
- [ ] Alternatives were considered and rejected with stated reasons
- [ ] Solution is specific to our constraints, not a generic template

### For Architecture & Design Decisions
- [ ] Problem decomposed from first principles
- [ ] At least 3 alternative approaches evaluated
- [ ] Trade-off matrix created for significant decisions
- [ ] Pre-mortem analysis conducted
- [ ] Decision documented with full reasoning chain
- [ ] Reversibility assessed (one-way door vs two-way door)

### For Peer Review (AI or Human)
- [ ] Independent analysis conducted before considering the suggestion
- [ ] Claims verified against authoritative sources
- [ ] Reasoning validated through first principles
- [ ] Performance claims benchmarked or cited
- [ ] Architectural implications assessed
- [ ] Decision (accept / reject / modify) documented with evidence

---

## Required Process for Every Suggestion

### 1. Own Brainstorming
- Think through the problem independently before considering the suggestion
- Identify the root cause from first principles
- Consider alternative approaches and solutions
- Question assumptions in the suggestion

### 2. Own Deep Analysis
- Analyze the technical merit of the suggestion
- Evaluate impact on system architecture and scalability
- Consider edge cases, failure modes, and implications
- Assess performance characteristics at scale
- Review compatibility with existing infrastructure

### 3. Deep Research

#### Scientific Research
- Search for academic papers on the topic
- Review computer graphics research (SIGGRAPH, ACM Transactions on Graphics)
- Check WebGL/OpenGL specifications and white papers
- Look for performance studies and benchmarks

#### Industry Best Practices
- Research how major teams handle similar problems
- Check implementations in production systems
- Review architectural patterns from large-scale applications

#### Senior-Level Repositories
- **Three.js**: Graphics rendering patterns, WebGL resource management
- **Babylon.js**: Scene graph architecture, texture pooling
- **PixiJS**: 2D rendering optimization, batch systems
- **PlayCanvas**: Entity-component systems, memory management
- **Regl**: Functional WebGL patterns, resource lifecycle
- **Luma.gl**: WebGL2 best practices, GPU resource management

#### Google & Web Research
- MDN WebGL documentation
- WebGL2 Fundamentals
- GPU Gems and GPU Pro series
- Browser vendor documentation (Chrome, Firefox, Safari)
- Performance profiling tools and techniques

#### Big Team-Level Engineering
- How do teams at Google, Meta, Adobe handle this?
- What patterns emerge in large codebases?
- What do game engine architects recommend?
- How do production WebGL applications solve this?

### 4. Citations & Evidence
- Collect specific citations from research
- Document performance data and benchmarks
- Reference specification sections
- Link to relevant source code examples
- Build evidence-based reasoning

### 5. Verification
- Cross-reference findings across multiple authoritative sources
- Test assumptions with local experiments if needed
- Consider real-world performance implications
- Validate against our specific architecture and constraints
- Check for consensus among experts

### 6. Decision Framework

**Accept if**:
- Scientifically validated across multiple sources
- Reasoning is sound and evidence-based
- Measurable performance or correctness benefit
- Aligns with industry best practices
- No negative architectural implications

**Push Back if**:
- Reasoning is flawed or based on incorrect assumptions
- Evidence contradicts the suggestion
- Better alternatives exist
- Conflicts with our architecture or requirements
- Performance claims are unsubstantiated

**Request Clarification if**:
- Suggestion is ambiguous or incomplete
- Need more context about specific constraints
- Research shows conflicting information
- Need to understand the reasoning better

### 7. Documentation
- Document the independent analysis
- Share findings with reasoning and citations
- Explain acceptance or rejection with evidence
- Suggest modifications if partially accepting

---

## Gemini/Claude Collaboration Philosophy

- **Listen actively**: AI models provide valuable peer review insights
- **Verify independently**: Always conduct own research before accepting
- **Collaborate constructively**: Push back respectfully with evidence
- **Maintain rigor**: Hold all suggestions (including own ideas) to same scientific standard
- **Keep ears open**: Be receptive to good insights while remaining critical
- **Double-check everything**: Trust but verify all claims
- **Demand specificity**: If a suggestion is vague, demand concrete evidence, code references, or benchmarks before considering it

---

## Anti-Patterns — What We Refuse to Accept

| Anti-Pattern | Why It Fails | What We Do Instead |
|---|---|---|
| "Best practice" without citation | Appeal to authority fallacy | Cite the source, explain *why* it's best for *our* case |
| Copy-paste from tutorials | Tutorials optimize for teaching, not production | Understand the pattern, adapt to our constraints |
| "Everyone does it this way" | Bandwagon fallacy | Analyze whether *we* should, given our specific requirements |
| Generic boilerplate | One-size-fits-none | Research what's specific to our scale, stack, and constraints |
| "It works" as sufficient proof | Absence of bugs ≠ correctness | Prove correctness through testing, specification conformance, and edge case analysis |
| Premature optimization | Optimizing without profiling data | Profile first, identify bottlenecks with data, then optimize surgically |
| Premature abstraction | Abstracting before understanding the pattern | Wait for 3+ concrete instances before abstracting |
| Untested assumptions | "I think the browser handles this" | Verify against specifications and test empirically |

---

## Wait for Approval

**IMPORTANT**: After conducting independent analysis, do NOT proceed with implementation until user says "let's go forward".

---

## Example Application

**Gemini suggests**: "Missing WebGL resource cleanup in dispose()"

**Independent verification process**:
1. **First Principles**: What does the WebGL spec say about resource lifetime? What happens to GPU memory when JS references are GC'd?
2. **Research**: Check WebGL spec on deleteVertexArray, deleteBuffer, deleteProgram. Read Khronos Group documentation.
3. **Check repos**: How do Three.js (`WebGLRenderer.dispose()`), Babylon.js (`engine.dispose()`) handle VAO/Buffer disposal? Read their actual source code.
4. **Analyze**: Is this a real memory leak? What's the lifecycle? What does Chrome's `about:gpu` show?
5. **Verify**: Does browser GC clean this up? What do specs say? Cross-reference across Chrome, Firefox, Safari implementations.
6. **Cite**: Provide spec sections, repo examples, performance data, browser bug tracker entries.
7. **Decide**: Accept/reject with full reasoning and evidence chain.

---

## Memory & Reference

This document is the **canonical reference** for all work standards in the Rare.lab project. It should be:
- Referenced before accepting any peer review suggestions, architectural recommendations, or technical insights
- Followed for every research task, analysis, component review, or implementation decision
- Updated as we discover new standards, sources, or anti-patterns worth documenting
