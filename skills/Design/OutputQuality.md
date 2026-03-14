# Output Quality

**Purpose**: Format selection, density principles, and anti-AI writing patterns for Design skill output. Defines **how to render** content (complements `Principles.md` which defines **what to include**).

Read this file before producing any design artifact. Apply its rules during writing, not as a post-hoc check.

---

## 0. The Governing Principle: Human Time > AI Output

AI output is cheap. Human attention is expensive and non-renewable. Every word you generate costs the reader time. Missing information is recoverable — the reader asks a follow-up. Wasted attention is not.

**Optimize for the reader's time, not for completeness.** If five points exist but four are obvious or low-value, include only the one that matters. The reader can ask for more. They cannot un-read noise.

> "Every word must earn its place. The default for any word, sentence, or section is deletion. Content survives only by proving it adds a fact, decision, or constraint the reader needs." — Orwell Rule 3, generalized

This principle overrides all others. When density and completeness conflict, density wins.

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

## 2. Hard Limits

Hard caps catch the worst offenders that "averages" let through. A 40-word sentence paired with a 6-word sentence averages to 23 — but the 40-word sentence still destroys comprehension.

| Metric | Limit | Source |
|--------|-------|--------|
| **Sentence length** | **25 words max** | ASD-STE100; American Press Institute (comprehension drops to ~50% at 28 words) |
| **Paragraph length** | **6 sentences max** | ASD-STE100 |
| **Bullet items per list** | **7 max** (prefer 5) | Miller's Law (7±2 working memory) |
| **Heading length** | **8 words max** | Information Mapping |
| **Noun clusters** | **3 consecutive nouns max** | ASD-STE100 ("fuel system pressure relief valve" → break it up) |
| **Hierarchy depth** | **3 heading levels max** (H2–H4) | Information Mapping |
| **Passive voice** | **< 10% of sentences** | Orwell Rule 4; STE active-voice mandate |

Any sentence over 25 words must be split. Any paragraph over 6 sentences must be split or compressed. These are not guidelines — they are constraints.

---

## 3. Density Principles

Write half as much. Then cut again.

- **50% Rule** — Use half the words of a natural first draft. Concise text improves usability by 58% (NNGroup). If a sentence can lose a word without losing meaning, cut it.

- **Front-Load Conclusions (BLUF)** — Bottom Line Up Front: first sentence of every section IS the section. A reader who reads only first sentences should understand the entire document. Supporting detail follows. Readers who stop early still get the point.

- **One Idea Per Paragraph** — If a paragraph covers two ideas, split it. Each paragraph earns its space with one clear point.

- **Headers as Standalone Summary** — Layer-cake test: read only the headers. They should tell a coherent story without the body text. Generic labels ("Overview", "Details") fail this test. "JWT chosen over sessions for stateless auth" passes it.

- **"So What?" Test** — Every paragraph must connect to a decision or action. If removing a paragraph changes nothing about what someone would do, remove it.

- **Kill the Setup** — Delete the first paragraph of any section if it merely restates the heading in prose form. AI almost always generates a "setup" paragraph. The second paragraph is usually where the real content starts.

- **Eliminate Non-Data-Ink** — Remove hedging ("it's worth noting that"), throat-clearing ("before we dive in"), meta-commentary ("as mentioned above"), and filler transitions ("with that said"). These add tokens without adding information.

- **Name Your Rules** — When a document introduces behavioral rules, give each one a short name ("Drop rule", "Merge rule"). Named rules can be referenced in tables, edge cases, and discussions without restating the definition. Unnamed rules force readers to re-derive meaning from context every time.

- **One Concept, One Name** — If two terms describe the same concept, pick one and drop the other. Competing vocabulary (e.g., a boolean `isActive` alongside a `status` enum that already encodes activeness) creates the illusion of two distinct ideas and forces readers to reconcile them. Derived aliases don't add information — they add confusion.

---

## 4. Signal Tests

These are binary pass/fail tests. Every sentence in the output must survive all of them.

### Falsifiability Gate (Taleb)

A sentence has signal if and only if it could be wrong. Unfalsifiable sentences sound reasonable but carry zero information.

| Fails (unfalsifiable — delete) | Passes (falsifiable — keep) |
|------|------|
| "This approach has several advantages" | "This approach reduces query latency from 200ms to 40ms" |
| "Security is an important consideration" | "The API exposes user emails without authentication" |
| "The system handles edge cases" | "The system returns HTTP 400 with error code E_INVALID_RANGE for inputs outside 0–100" |

If a sentence is true regardless of what approach was chosen, it carries no information about this specific design.

### One New Fact Rule (Graham)

Every sentence must introduce at least one fact, decision, or constraint that no previous sentence stated. If two sentences convey the same information in different words, keep the better one and delete the other.

> Useful writing = importance × novelty × correctness × strength. If any factor is zero, the sentence is worthless. — Paul Graham

### Prediction Test (Shannon)

If a reader could predict the sentence from the heading alone, the sentence adds no information. Delete it.

- "Security Considerations: Security is an important consideration for this design." → predictable from heading, delete.
- "Security Considerations: All API keys rotate every 24h; revoked keys return 403 within 60s." → not predictable, keep.

### State Once Rule (Tufte)

Each fact appears in exactly one canonical section. Summaries may reference ("See Approach") but never restate. If the same claim appears in two sections, delete one. Repetition creates the illusion of progress while the reader learns nothing new.

---

## 5. Compression Protocol

After drafting, run a structured compression pass at four levels. Each level catches different waste.

### Level 1 — Lexical Compression
Remove filler words and replace wordy phrases. See the Wordy Phrase Table below.

### Level 2 — Sentential Compression
For each sentence:
1. Does this add a fact the reader didn't have? If no → delete.
2. Can any word be removed without losing meaning? If yes → remove it.
3. Does this sentence restate what a previous sentence said? If yes → delete.

### Level 3 — Structural Compression
For each section:
1. Does this section exist because a template included it, or because the content demands it? Template filler → delete.
2. Could this section be swapped into a different design document without anyone noticing? If yes → it's generic noise, not specific content. Delete or rewrite with specifics.
3. Is the section longer than 300 words? If yes → compress or split.

### Level 4 — Conceptual Compression
For each group of related paragraphs:
1. Do three paragraphs each describe a specific case of the same pattern? Replace with one paragraph describing the pattern + a table of cases.
2. Can the entire section be replaced by a table? If the data has items × attributes, it should be a table.

---

## 6. Wordy Phrase Table

Mechanical replacements. Apply during Level 1 compression.

| Wordy Phrase | Replacement |
|-------------|------------|
| in order to | to |
| due to the fact that | because |
| at this point in time | now |
| in the event that | if |
| for the purpose of | to / for |
| with regard to / in regard to / with respect to | about |
| in addition | also |
| prior to | before |
| subsequent to | after |
| in the absence of | without |
| on a regular basis | regularly |
| a large number of | many |
| in close proximity to | near |
| take into consideration | consider |
| is able to / has the ability to | can |
| make a determination | determine |
| provide a description of | describe |
| give consideration to | consider |
| it is necessary that | must / need |
| establish connectivity | connect |
| each and every | each |
| first and foremost | first |
| in the process of | (delete, restructure) |

---

## 7. Vocabulary Clarity

### Jargon Check

Prefer plain terms over specialized jargon when the simpler word conveys the same meaning. If the author has to pause and recall what a term means, readers will too. Test: could you explain this to a teammate outside your sub-domain without defining the term first? If not, use the simpler word.

| Jargon | Plainer Alternative |
|--------|-------------------|
| sentinel value | marker, reserved value |
| idempotent | safe to repeat, re-runnable |
| reify | make concrete, materialize |

This is not a ban on technical terms — precision matters. Use domain terms when they carry meaning that plain words don't. The test is whether the jargon adds precision or just adds distance between the reader and the idea.

### Anti-AI Vocabulary

AI-generated text has recognizable tells. Eliminate them.

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

### Banned Adverbs

Remove these unless they change the factual meaning of the sentence (they almost never do):

> quite, very, really, extremely, simply, easily, effectively, quickly, highly, significantly, basically, actually, generally, essentially, fundamentally, importantly

Test: delete the adverb. Does the sentence mean something different? If not, the adverb was noise.

### Banned Structural Patterns

- **Negative parallelism** — "It's not just X, it's Y" or "It's not merely X, it's a Y." Write what it IS, not what it isn't-then-is.
- **Trailing participles** — "...enabling teams to collaborate more effectively." End sentences with concrete outcomes, not dangling benefits.
- **Over-formatting** — Bolding every third word dilutes emphasis. Bold only key terms that aid scanning.
- **Repetitive summary phrases** — "In summary", "To summarize", "In conclusion", "As we've seen." The content summarizes itself.
- **Promotional tone** — "Exciting opportunity", "powerful solution", "best-in-class." State facts. Let the reader evaluate.
- **Adjectives of degree without data** — "significant improvement", "substantial reduction", "considerable effort." Replace with a number or delete. "Significant" means nothing without a measure.

### Banned Meta-Commentary

These phrases comment on the document itself instead of conveying information. Delete all of them.

> "This section will cover...", "As discussed above...", "It's worth noting that...", "Let's explore...", "Before diving in...", "To summarize...", "In this document we...", "The following section outlines...", "Moving on to...", "With that being said...", "Let's now turn our attention to...", "As previously mentioned...", "It goes without saying...", "When it comes to...", "At the end of the day..."

### Simplicity Test

If it sounds like a press release, rewrite it. Design documents inform decisions — they do not sell.

---

## 8. Coherence Gate

Individual sentences sounding fine while the document feels incoherent is a specific failure mode of AI-generated text. Run these tests after the compression pass.

- **Paragraph Progression** — Does each paragraph build on or extend the previous one? If two adjacent paragraphs could be swapped without the reader noticing, the text lacks logical flow. Insert a causal connective ("because", "therefore", "however") or restructure.

- **No Circular Elaboration** — If paragraph N says the same thing as paragraph N-2 in different words, delete one. This is the most common AI coherence failure: each sentence sounds reasonable, but the document circles the same point.

- **Causal Connectives Test** — Between any two consecutive paragraphs, you should be able to insert "because," "therefore," "however," or "for example." If none fits, the logical relationship is missing — add it or restructure.

---

## 9. Macro-Structure

Format selection (section 1) and density (section 3) operate at the section and sentence level. Macro-structure operates at the document level — how information flows from start to finish.

- **Lead with narrative** — Before any tables or details, give the reader 3-5 sentences that tell the whole story. A reader who stops after this paragraph should understand the approach, the key trade-off, and why it's safe.

- **Organize by reader need, not by author discovery** — The order you figured things out is rarely the order someone else needs to receive them. Put the "what and why" before the "how." Put decisions before mechanisms.

- **Create stopping points** — If a document serves multiple audiences, use an explicit boundary (a horizontal rule, a heading like "Implementation Reference") so each reader knows where they can stop. A reviewer shouldn't have to read implementation details to evaluate the design.

- **Trust your structure** — If the heading communicates the boundary, don't also narrate it. "Reviewers can stop here" above an "Implementation Reference" section says the same thing twice. Let section titles do their job.

- **Reduce duplication across sections** — When the same fact appears in a summary, a detail section, and an impact table, it creates maintenance burden and gives the reader a sense of repetition without progress. State facts once in their canonical section. Summaries reference; they don't restate. (See: State Once Rule in section 4.)

---

## 10. Override Policy

Format and banned-term rules are defaults, not absolutes. An agent may deviate with a brief inline justification when the data shape genuinely doesn't fit the default format. The justification must reference data shape, not preference.

Example of valid override: "Using prose for Alternatives because each option requires a multi-step causal argument that a table cannot express."

Example of invalid override: "Using prose because it reads better."

---

## Source Attribution

| Source | Contribution |
|--------|-------------|
| NNGroup (Jakob Nielsen) | 50% Rule, concise writing usability data (+58%, +124% combined), F-pattern scanning |
| Edward Tufte | Data-ink ratio, non-data-ink elimination, State Once |
| Google Developer Style Guide | Format selection by data shape, table usage |
| WAC Clearinghouse | Writing format selection research |
| Wikipedia Manual of Style | Banned vocabulary patterns in AI-generated text |
| ASD-STE100 Simplified Technical English | Hard sentence/paragraph limits (20/25 word caps, 6-sentence paragraphs) |
| US Military (AR 25-50) | BLUF (Bottom Line Up Front), active voice mandate |
| George Orwell | 6 rules for clear writing, especially Rule 3 ("If it is possible to cut a word out, always cut it out") |
| Paul Graham | Usefulness formula (importance × novelty × correctness × strength), simple writing |
| Nassim Taleb | Via negativa, falsifiability as signal test |
| Claude Shannon | Information theory — surprise = information; predictable sentences carry zero bits |
| American Press Institute | Sentence length vs. comprehension data |
| Federal Plain Language Guidelines | Wordy phrase replacements, nominalization bans |
| Microsoft Style Guide | Simple words, concise sentences, verb-first structure |
| John Carroll (Minimalism) | 50-75% content cut with no performance loss, action-first structure |
| Robert Horn (Information Mapping) | 7±2 chunking, one info type per section, max 7-word headings |
| Sarah Richards (Content Design) | "Half then half again" reduction technique |
| Torrey Podmajersky | Component-level word budgets |
