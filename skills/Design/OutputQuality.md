# Output Quality

**Purpose**: Format selection, density principles, and anti-AI writing patterns for Design skill output. Defines **how to render** content (complements `Principles.md` which defines **what to include**).

Read this file before producing any design artifact. Apply its rules during writing, not as a post-hoc check.

---

## 1. Format Selection by Data Shape

Choose the format that matches the data's shape. When in doubt, prefer structured formats over prose.

| Data Shape | Format | Example |
|-----------|--------|---------|
| Items compared across attributes | **TABLE** | Alternatives Considered, Decision Log |
| Parallel items of the same type | **BULLET LIST** | Goals, Non-Goals, Risks |
| Ordered or ranked items | **NUMBERED LIST** | Open Questions, prioritized steps |
| Causality, reasoning, narrative | **PROSE** | Problem statement, Approach |
| Fewer than 3 items | **INLINE** | Appetite, single data points |

**Table cell limit**: Maximum 2 sentences per cell. If a cell needs more, the table structure is wrong.

**Format Justification Rule**: When choosing prose over a structured format, the content must have causality or narrative that tables/lists cannot express. "It felt more natural as prose" is not a valid justification — cite the data shape.

### Section Format Guide (Design Template)

Default format for each section in the `CreateDesign` output template:

| Template Section | Default Format | Rationale |
|-----------------|---------------|-----------|
| Problem | 1-2 sentences prose | POV statement is causality |
| Current State | Bullet list or table | Parallel facts |
| Appetite | Inline | Single data point |
| Goals | Bullet list | Parallel items |
| Non-Goals | Bullet list | Parallel items |
| Approach | Prose + diagrams | Reasoning and causality |
| Alternatives Considered | Table (mandatory) | 2D comparison |
| Risks & Rabbit Holes | Bullet list | Parallel items |
| User Impact | Prose or bullet list | Depends on scope |
| Open Questions | Numbered list | Ordered by priority |
| Decision Log | Table (mandatory) | 2D comparison |

---

## 2. Density Principles

Write half as much. Then cut again.

- **50% Rule** — Use half the words of a natural first draft. Concise text improves usability by 58% (NNGroup). If a sentence can lose a word without losing meaning, cut it.

- **Front-Load Conclusions** — Inverted pyramid: first sentence = the answer. Supporting detail follows. Readers who stop early still get the point.

- **One Idea Per Paragraph** — If a paragraph covers two ideas, split it. Each paragraph earns its space with one clear point.

- **Headers as Standalone Summary** — Layer-cake test: read only the headers. They should tell a coherent story without the body text. Generic labels ("Overview", "Details") fail this test.

- **"So What?" Test** — Every paragraph must connect to a decision or action. If removing a paragraph changes nothing about what someone would do, remove it.

- **Eliminate Non-Data-Ink** — Remove hedging ("it's worth noting that"), throat-clearing ("before we dive in"), meta-commentary ("as mentioned above"), and filler transitions ("with that said"). These add tokens without adding information.

---

## 3. Anti-AI Writing Patterns

AI-generated text has recognizable tells. Eliminate them.

### Banned Vocabulary

| Remove | Use Instead |
|--------|-------------|
| delve | examine, explore, look at |
| tapestry | mix, combination |
| landscape | field, area, space |
| multifaceted | complex, varied |
| nuanced | subtle, specific |
| pivotal | important, key |
| intricate | complex, detailed |
| comprehensive | complete, thorough, full |
| realm | area, domain |
| foster | encourage, support, build |
| leverage | use |
| underscore | highlight, show |
| navigate | handle, work through |
| harness | use, apply |
| cutting-edge | modern, current, new |
| game-changing | significant, important |
| robust | strong, reliable, solid |
| seamless | smooth, integrated |

### Banned Structural Patterns

- **Negative parallelism** — "It's not just X, it's Y" or "It's not merely X, it's a Y." Write what it IS, not what it isn't-then-is.
- **Trailing participles** — "...enabling teams to collaborate more effectively." End sentences with concrete outcomes, not dangling benefits.
- **Over-formatting** — Bolding every third word dilutes emphasis. Bold only key terms that aid scanning.
- **Repetitive summary phrases** — "In summary", "To summarize", "In conclusion", "As we've seen." The content summarizes itself.
- **Promotional tone** — "Exciting opportunity", "powerful solution", "best-in-class." State facts. Let the reader evaluate.

### Simplicity Test

If it sounds like a press release, rewrite it. Design documents inform decisions — they do not sell.

---

## Override Policy

Format and banned-term rules are defaults, not absolutes. An agent may deviate with a brief inline justification when the data shape genuinely doesn't fit the default format. The justification must reference data shape, not preference.

Example of valid override: "Using prose for Alternatives because each option requires a multi-step causal argument that a table cannot express."

Example of invalid override: "Using prose because it reads better."

---

## Source Attribution

| Source | Contribution |
|--------|-------------|
| NNGroup (Jakob Nielsen) | 50% Rule, concise writing usability data (+58%) |
| Edward Tufte | Data-ink ratio, non-data-ink elimination |
| Google Developer Style Guide | Format selection by data shape, table usage |
| WAC Clearinghouse | Writing format selection research |
| Wikipedia Manual of Style | Banned vocabulary patterns in AI-generated text |
