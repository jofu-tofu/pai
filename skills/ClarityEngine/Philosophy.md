# Comprehension Principles

> PAI's universal clarity layer. AI output is cheap; human comprehension is the bottleneck.
> This file is a self-contained reference. Any agent producing human-facing output can read
> and apply these principles without invoking ClarityEngine workflows.

---

## The Five Principles

### 1. Layman First, Expert Second (Progressive Disclosure)

**WHY:** Most readers need the conclusion, not the proof. Experts can dig deeper; non-experts cannot dig at all.

**WHAT:** Lead with a summary any intelligent non-expert understands. Build depth in 2-3 layers max. 80% of readers get full value from layer 1 alone.

**ANTI-PATTERN:** "Expert Gatekeeping" — opening with jargon, acronyms, or domain-specific framing that excludes the primary audience.

**TEST:** Can someone outside the domain read the first paragraph and know what this is about, what was decided, and why it matters?

*Sources: Cognitive Load Theory (Sweller 1988), Progressive Disclosure (Nielsen Norman Group)*

### 2. Skip-Friendly by Design (Section Independence)

**WHY:** Readers don't read linearly. They scan, jump, and sample. Content that requires sequential reading punishes real reading behavior.

**WHAT:** Every section works independently. No "as mentioned above." Readers get 70%+ of the message from headings + bold + bullets alone.

**ANTI-PATTERN:** "Narrative Dependence" — section N requires reading sections 1 through N-1 to be understood.

**TEST:** Pick any section at random. Can you understand its main point without reading anything before it?

*Sources: F-Pattern Reading (Nielsen Norman Group), Information Foraging Theory (Pirolli & Card)*

### 3. Clarity Over Brevity (Prefer Skipping Over Vagueness)

**WHY:** Brevity that sacrifices meaning creates more work than length. A vague summary forces the reader to hunt for the real answer.

**WHAT:** Prefer omitting a section over writing vague or jargon-laden content. Use specific examples over formulaic structure. Mark uncertainty explicitly rather than projecting false confidence.

**ANTI-PATTERN:** "Compression Damage" — shortening content until the meaning becomes ambiguous or requires domain knowledge to reconstruct.

**TEST:** Does every sentence add specific information the reader didn't have before? Could a reader act on this without asking follow-up questions?

*Sources: Plain Language movement (plainlanguage.gov), Flesch Readability Research*

### 4. Scannable Architecture (Visual-First, Inverted Pyramid, Chunking)

**WHY:** Working memory holds 3-5 chunks. Documents that exceed this per section force re-reading and increase error rates. For technical content, a diagram communicates structure faster and more accurately than prose.

**WHAT:** For technical content, diagrams and visual structures carry the primary narrative load — prose serves as annotation and context, not the other way around. Every major concept must be presented visually first (diagram, table, flow, or comparison grid), then supported with text explanation. Subheadings every 100-150 words. 3-5 groups per heading level. Max 4 heading levels. Alert-Summary-Detail layering. Max 3 type sizes. Every visual element must carry information — remove decoration.

**ANTI-PATTERN:** "Wall of Text" — dense paragraphs without structural breaks. "Prose-First" — explaining a system architecture in paragraphs when a diagram would communicate the same structure in seconds. Also "Decoration Theater" — visual elements that look professional but encode no information.

**TEST:** (1) Remove all body text, leaving only headings, bold text, and bullet points. Does the document still tell a coherent story? (2) For each major section in technical content, does a visual element exist that conveys the core idea independently of surrounding prose?

*Sources: Miller's Chunking (1956), Tufte's Data-Ink Ratio, Inverted Pyramid (journalism), Mayer's Multimedia Principle*

### 5. Evidence Over Assertion (Trust Through Specificity)

**WHY:** AI-generated content suffers a trust deficit. Specific, verifiable claims build trust; confident generalities erode it.

**WHAT:** Use real identifiers (file names, type signatures, function names) — not abstract labels. Include concrete numbers. Show your work. Acknowledge what you don't know.

**ANTI-PATTERN:** "Confident Vagueness" — authoritative tone with no traceable evidence. Diagrams with labels like "Data Layer" instead of actual module names.

**TEST:** For each claim, can the reader verify it? For each diagram label, does it correspond to something real in the source material?

*Sources: AI Content Trust Research (CHI 2024), PNAS 2023, C4 Model Notation*

---

## The Readability Contract

15 checkpoints distilled from 54 research-backed rules. Organized by principle.

### From Principle 1 — Layman First

- **RC-1:** Summary sections target Flesch 60-70 readability. Average sentence length 15-20 words.
- **RC-2:** Jargon defined on first use. Acronyms expanded on first occurrence.

### From Principle 2 — Skip-Friendly

- **RC-3:** Subheadings every 100-150 words. Max 4 heading levels (H1-H4).
- **RC-4:** Section anchors on H2/H3. Sticky ToC for documents exceeding 3 screen-heights.
- **RC-5:** Leading summary sentence per section. Each section works independently.

### From Principle 3 — Clarity Over Brevity

- **RC-6:** No empty or generic headings. Every heading describes the content below it.
- **RC-7:** Specific examples in every major section. Uncertainty explicitly marked.

### From Principle 4 — Scannable Architecture

- **RC-8:** Max 3-5 chunks per group. 3-5 groups per heading level (Miller's Law).
- **RC-9:** Key information carried by headings + bold + bullets (70% comprehension rule).
- **RC-10:** Max 3 type sizes. No decorative elements that don't encode information.

### From Principle 5 — Evidence Over Assertion

- **RC-11:** Real identifiers from source in diagrams. No abstract labels ("Data Layer").
- **RC-12:** Self-contained diagrams: title, legend, labeled elements. Max 20 elements per diagram.
- **RC-13:** Claims traceable to source. Data flows labeled with actual types.
- **RC-14:** WCAG AA contrast (4.5:1 normal, 3:1 large). Colorblind-safe palettes. Consistent color semantics.
- **RC-15:** Code blocks: syntax highlighting, monospace font, no horizontal scroll, distinct background.

---

## Codebase Analysis Addendum

When the content type is `codebase-analysis`, apply these principle-mapped extensions:

**Scannable Architecture (P4):**
- Boundary identification: every component appears as a labeled boundary in at least one diagram
- Layer identification: architectural layers explicitly named and dependency direction shown
- Layer violations and circular dependencies flagged as visually distinct callouts
- Async vs sync flows visually distinguished

**Evidence Over Assertion (P5):**
- Data flows labeled with concrete types (`Promise<Deal>`, not "async result")
- Component boxes include 2-4 representative type signatures from the actual code
- Entry points, key interfaces, and runtime dependencies listed with real identifiers
- External service dependencies documented with availability context
- Problems stated as observations, not prescriptions

**Skip-Friendly by Design (P2):**
- Parallel paths shown side-by-side in grid layout, not sequentially
- Divergence points annotated with the architectural decision causing the split

---

## How to Use This File

Read these principles before producing any document intended for human review. Apply the Readability Contract checkpoints as a quality gate. The principles are stable; the checkpoints may evolve as new evidence emerges.

This file has no dependencies on other ClarityEngine files. It is designed to be read and applied in isolation.
