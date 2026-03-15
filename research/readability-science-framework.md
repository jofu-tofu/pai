# Scientific Frameworks for Human Readability in Document Design

> **Research date:** 2026-03-14
> **Purpose:** Evidence base for improving the Design skill's output quality — reducing verbosity, enabling dynamic scope selection, and grounding formatting rules in empirical research.
> **Method:** Extensive parallel research (9 agents) across cognitive psychology, technical communication, UX research, journalism, and AI/LLM studies. All URLs verified via webfetch.

---

## Executive Summary

The science of readability converges on a single meta-principle: **human attention is finite, non-renewable, and more expensive than any content**. Seven independent research traditions — cognitive load theory, working memory research, web reading behavior studies, minimalist instruction, information foraging theory, journalism's inverted pyramid, and LLM verbosity research — all arrive at the same conclusion: **less, better-structured content outperforms more content**, often dramatically (Nielsen measured 124% usability improvement from combining conciseness + scannability + objectivity).

The practical framework that emerges has three layers:

1. **Capacity constraints** — Working memory holds 3-5 chunks (Cowan 2001). Every section, list, or concept group must respect this limit.
2. **Attention economics** — Readers scan, don't read (79% of web users scan; Nielsen 1997). Information must be front-loaded, chunked, and visually hierarchical.
3. **Noise is actively harmful** — Extra content isn't neutral filler; it's extraneous cognitive load that competes with comprehension (Sweller 1988). The redundancy effect proves that even *accurate* duplicate information degrades learning.

---

## Theme 1: Cognitive Load Theory — The Master Framework

### The Three Types of Load

**Source:** John Sweller (1988). "Cognitive load during problem solving: Effects on learning." *Cognitive Science*, 12(2), 257-285.
**Verified URL:** https://en.wikipedia.org/wiki/Cognitive_load

| Load Type | Definition | Document Design Implication |
|-----------|-----------|---------------------------|
| **Intrinsic** | Inherent complexity of the material itself | Cannot be reduced — set by the topic. But can be *managed* by sequencing (teach components before combinations). |
| **Extraneous** | Caused by poor presentation/design | **This is what bad documents create.** Every confusing layout, irrelevant section, poor navigation choice, wall of text, or verbose explanation adds extraneous load. |
| **Germane** | Productive effort devoted to understanding | **This is what good documents maximize.** Clear structure, meaningful headings, progressive disclosure all channel cognitive effort toward actual comprehension. |

**Key insight:** Total cognitive load (intrinsic + extraneous + germane) must not exceed working memory capacity. Since intrinsic load is fixed by the topic, the *only* design lever is minimizing extraneous load to free capacity for germane processing.

**Implication for Design skill:** Every word, section, or formatting choice that doesn't reduce intrinsic load or support germane processing is *actively harmful* — it's not neutral filler, it's extraneous load competing for finite cognitive resources.

### The Redundancy Effect

**Source:** Sweller, Chandler, Kalyuga (2003). "The Redundancy Effect in Multimedia Learning."

- Presenting the same information in multiple formats simultaneously (e.g., a diagram AND a full prose description of that diagram) *reduces* learning compared to presenting just one.
- Redundant information is not free — it costs processing effort.
- **Implication:** Don't explain in prose what a code example already shows. Don't narrate a diagram. Pick the best representation and trust it. The instinct to "be thorough" by duplicating information in multiple forms actively degrades comprehension.

### The Seductive Details Effect

**Source:** Harp & Mayer (1998). "How Seductive Details Do Their Damage."

- Interesting but irrelevant information significantly reduces learning of the core material.
- Seductive details hijack attention and working memory away from the main content.
- **Implication:** Tangential context, historical background, and "nice to know" details should be ruthlessly cut or deferred. They aren't enriching the document — they're sabotaging it.

### The Expertise Reversal Effect

**Source:** Kalyuga, Ayres, Chandler & Sweller (2003). "The Expertise Reversal Effect." *Educational Psychologist*, 38(1), 23-31.

- Instructional techniques that help novices can actually *harm* experts.
- Detailed step-by-step explanations that aid beginners become extraneous load for experienced readers.
- **Implication:** One-size-fits-all documentation fails both audiences. This is the strongest research argument for **scope-sensitive, audience-aware content selection** — the exact problem the Design skill needs to solve.

---

## Theme 2: Working Memory — The Hard Constraint

### Miller's Law (Revised)

**Source (original):** George A. Miller (1956). "The Magical Number Seven, Plus or Minus Two." *Psychological Review*.
**Source (revision):** Nelson Cowan (2001). "The magical number 4 in short-term memory." *Behavioral and Brain Sciences*, 24, 87-185.
**Verified URL:** https://www.nngroup.com/articles/chunking/

- Miller's original 7±2 has been revised downward. Cowan's meta-analysis found the true capacity of working memory is closer to **4±1 chunks**.
- A "chunk" is a meaningful unit — its size depends on expertise (an expert's chunk can contain more raw information).
- **Implication:** Document sections should present no more than 3-5 key concepts before providing a break, summary, or transition. Bullet lists beyond ~5-7 items should be sub-grouped. This is a *hard cognitive constraint*, not a style preference.

### Chunking

**Source:** NNG (Kate Moran, 2016). "How Chunking Helps Content Processing."
**Verified URL:** https://www.nngroup.com/articles/chunking/

- Chunking = breaking content into small, distinct, meaningful units.
- Chunked content enables scanning (users' preferred reading mode).
- Key methods: short paragraphs with whitespace, short text lines (50-75 characters), clear visual hierarchies, distinct groupings.
- **Critical insight from NNG:** "Simply chunking your text isn't enough — you also need to support scanning by making it easy to quickly identify the main points of the chunks" via headings, highlighted keywords, bulleted lists, and short summary paragraphs.

---

## Theme 3: Web Reading Behavior — Nobody Reads

### The Scanning Majority

**Source:** Jakob Nielsen (1997). "How Users Read on the Web." Nielsen Norman Group.
**Verified URL:** https://www.nngroup.com/articles/how-users-read-on-the-web/

**Landmark finding:** 79% of users scan any new page; only 16% read word-by-word.

Nielsen tested 5 versions of the same content with different writing styles:

| Version | Change | Usability Improvement |
|---------|--------|----------------------|
| Promotional (control) | Marketese, boastful | 0% (baseline) |
| **Concise** | Half the word count | **58%** |
| **Scannable** | Same text, bullet layout | **47%** |
| Objective | Neutral language | 27% |
| **Combined** | Concise + scannable + objective | **124%** |

**This is the single most important quantitative finding for the Design skill.** Cutting word count in half + making it scannable + removing subjective claims = 124% usability improvement. These are not opinions — they're measured effects.

### The F-Pattern

**Source:** Kara Pernice (2017). "F-Shaped Pattern of Reading on the Web." Nielsen Norman Group.
**Verified URL:** https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/

- The F-pattern (heavy reading at top, declining attention downward, left-side scanning) is the *default* when there are no formatting cues to guide the eye.
- The F-pattern is **bad for users and businesses** — it means readers miss content lower on the page.
- **The F-pattern is a symptom of bad formatting, not an inherent behavior.** Good design (headings, bullets, bold keywords, front-loaded sentences) prevents it.
- Three conditions that cause F-scanning: (1) wall of text with no formatting, (2) user trying to be efficient, (3) user not committed enough to read every word.

**Antidotes (from NNG):**
1. Front-load important content in first two paragraphs
2. Use headings and sub-headings frequently
3. Bold important words and phrases
4. Use bulleted and numbered lists
5. Cut unnecessary content ruthlessly

### Layer-Cake Scanning Pattern

- When documents have strong headings/subheadings, users exhibit the "layer-cake pattern" — they scan headings and selectively dive into sections of interest.
- This is the *desired* pattern. It means the document's structure is working as a navigation aid.
- **Implication for Design skill:** Headers should function as a standalone summary. A reader scanning only headers should understand the document's arc.

---

## Theme 4: The Inverted Pyramid — Front-Load Everything

### Journalism's Core Structure

**Source:** NNG (Amy Schade, 2018). "Inverted Pyramid: Writing for Comprehension."
**Verified URL:** https://www.nngroup.com/articles/inverted-pyramid/
**Historical source:** Pöttker, Horst (2003). "News and its communicative quality: The inverted pyramid — when and why did it appear?" *Journalism Studies*, 4(4), 501-511.

Structure: Most important information first → supporting details → background/context last.

Benefits verified by research:
1. **Improved comprehension** — readers form mental models faster
2. **Decreased interaction cost** — main point without extensive reading
3. **Encourages scrolling** — engagement draws readers deeper
4. **Supports skimmers** — readers can stop at any point and still have the main point
5. **Survives truncation** — the document can be cut from the bottom without losing its core message

**Application at every level:**
- **Document level:** Lead with the conclusion/recommendation
- **Section level:** Each section restarts a smaller inverted pyramid
- **Paragraph level:** First sentence = most important information in that paragraph
- **Sentence level:** First words should be information-carrying

### BLUF (Bottom Line Up Front)

**Source:** U.S. Army writing doctrine; widely adopted in military/government communication.

- Put the conclusion, recommendation, or key finding in the first sentence or paragraph.
- Context, methodology, and background follow only for those who need it.
- **Implication:** Design documents should lead with "what was decided and why" — not with problem history, exploration narrative, or methodology.

---

## Theme 5: Progressive Disclosure — Reveal in Layers

**Source:** Jakob Nielsen (2006). "Progressive Disclosure." Nielsen Norman Group.
**Verified URL:** https://www.nngroup.com/articles/progressive-disclosure/

Core idea: Initially show only the most important options/information. Disclose secondary material only on request.

**Research-backed benefits:**
1. Helps novices prioritize attention on what matters most
2. Saves advanced users from scanning past irrelevant features
3. Improves learnability, efficiency, and error rate (3 of usability's 5 components)
4. People understand a system *better* when you help them prioritize features

**Two critical requirements:**
1. **Get the split right** — primary must contain everything frequently needed; secondary must be clearly optional
2. **Make progression obvious** — clear mechanics and strong information scent for "learn more"

**Practical limit:** Designs beyond 2 disclosure levels typically have low usability. Users get lost.

**Implication for Design skill:** This directly addresses the "too much content" problem. A design document should have a clear primary layer (problem + decision + key trade-offs) and an optional secondary layer (detailed alternatives, implementation specifics, background research). Most readers should get full value from layer 1.

---

## Theme 6: Minimalist Instruction — Less Really Is More

### Carroll's Minimalism

**Source:** John M. Carroll (1990). *The Nurnberg Funnel: Designing Minimalist Instruction for Practical Computer Skill*. MIT Press.

**Quantitative findings from IBM studies (1984-1990):**

| Metric | Traditional Manual | Minimalist Manual | Improvement |
|--------|-------------------|-------------------|-------------|
| Time to first task | ~4 hours | ~2.4 hours | **40% faster** |
| Errors during learning | Baseline | 50% fewer | Significant |
| Transfer to new tasks | Baseline | ~25% better | Notable |
| Document volume | 100% | ~25-30% | **70-75% reduction** |

**The 4 Minimalist Principles:**
1. **Choose an action-oriented approach** — Users want to *act*, not read. They come to documentation to accomplish tasks, not learn systems.
2. **Anchor in the task domain** — Describe tasks in the user's work domain, not the system's architecture.
3. **Support error recognition and recovery** — Up to 25-50% of user time is spent in error states (Carroll & Rosson 1987). Include troubleshooting inline.
4. **Support reading to do, study, and locate** — Users don't read linearly. Every section must be independently comprehensible.

**Key insight:** Carroll proved that cutting 70-75% of document content *improved* task performance by 40%. The removed content wasn't just unnecessary — it was actively slowing users down.

### Diataxis Framework

**Source:** Daniele Procida. "Diátaxis: A systematic approach to technical documentation authoring."
**Verified URL:** https://diataxis.fr/

Four distinct documentation types, each serving a different user need:

| Type | User Need | Orientation |
|------|-----------|-------------|
| **Tutorial** | Learning | Learning-oriented, doing |
| **How-to guide** | Achieving a goal | Task-oriented, doing |
| **Reference** | Looking up information | Information-oriented, knowing |
| **Explanation** | Understanding | Understanding-oriented, knowing |

**Key insight:** Mixing these types in a single document creates confusion. A design document is primarily *explanation* (understanding decisions) with elements of *reference* (looking up what was decided). It is NOT a tutorial or how-to guide. The Design skill should avoid drifting into instructional territory.

---

## Theme 7: Information Foraging Theory — The Scent Trail

**Source:** Peter Pirolli & Stuart Card (1999). "Information Foraging." *Psychological Review*.

- Readers behave like animals foraging for food — they follow "information scent" (cues that signal relevance).
- When scent is strong (descriptive headings, front-loaded sentences, clear topic sentences), readers efficiently navigate to what they need.
- When scent is weak (vague headings, buried conclusions, unclear relevance), readers either abandon the document or fall into F-pattern scanning.
- **Implication:** Every heading, first sentence, and structural cue in a design document is an information scent signal. "Background" is weak scent. "Why we chose X over Y" is strong scent.

---

## Theme 8: Signal-to-Noise — When More Hurts

### The Paradox of Completeness

Multiple research traditions converge on this finding: **additional accurate information can *reduce* comprehension**.

| Effect | Source | Finding |
|--------|--------|---------|
| Redundancy Effect | Sweller et al. (2003) | Duplicate information in multiple formats reduces learning |
| Seductive Details | Harp & Mayer (1998) | Interesting but irrelevant details reduce learning of core material |
| Expertise Reversal | Kalyuga et al. (2003) | Helpful-for-novices detail becomes harmful noise for experts |
| Information Overload | Eppler & Mengis (2004) | Beyond an optimal point, more information degrades decision quality |
| Curse of Knowledge | Camerer, Loewenstein & Weber (1989) | Experts overestimate what others know, adding unnecessary explanation |

**Combined implication:** The instinct to "be complete" or "be thorough" is the single biggest enemy of document quality. Every section must pass the "so what?" test: does removing this section reduce the reader's ability to understand or act? If not, cut it.

### Shannon's Communication Theory Applied to Documents

**Source:** Claude Shannon (1948). "A Mathematical Theory of Communication."

- In communication theory, the channel has finite capacity. Signal competes with noise for bandwidth.
- In documents, the reader's working memory is the channel. Every sentence of signal competes with every sentence of noise for cognitive bandwidth.
- **Unlike a wire, the reader can't increase bandwidth.** The only lever is increasing the signal-to-noise ratio.

---

## Theme 9: LLM Verbosity — Why AI Makes This Worse

### RLHF Creates Verbosity Bias

**Source:** Singhal, Goyal, Xu & Durrett (2023). "A Long Way to Go: Investigating Length Correlations in RLHF." Accepted at COLM 2024.
**Verified URL:** https://arxiv.org/abs/2310.03716

**Finding:** RLHF reward models systematically prefer longer responses regardless of quality. Models learn that longer = higher reward, creating an inherent verbosity bias. A purely length-based reward reproduces most downstream RLHF improvements over SFT models — meaning much of what looks like "quality improvement" from RLHF is actually just "the model learned to write more."

**Practical implications for skill design:**
1. Telling an LLM "be concise" fights against its reward gradient. Vague instructions like "be brief" are less effective than:
   - **Explicit word budgets** (e.g., "500-1000 words total")
   - **Structured output formats** with per-section limits
   - **Specific anti-patterns to avoid** (e.g., banned phrases, banned structural patterns)
2. LLMs have a strong prior toward "completeness" — they want to mention every consideration, caveat, and edge case. This maps directly to the seductive details effect and the redundancy effect.
3. The most effective countermeasure is **structural constraints** (templates with budgets) rather than behavioral instructions ("don't be verbose").

---

## Synthesis: A Unified Framework for Document Readability

### The Three Laws of Document Design

Based on the converging evidence across all nine research traditions:

**Law 1: Respect the Channel (Working Memory)**
- 3-5 chunks per section maximum (Cowan 2001)
- Bullet lists ≤7 items (Miller 1956)
- Sentence length ≤25 words (API comprehension research)
- Paragraphs ≤6 sentences
- Heading hierarchy ≤3 levels

**Law 2: Front-Load Everything (Inverted Pyramid)**
- Document leads with conclusion/decision
- Each section leads with its takeaway
- Each paragraph leads with its key point
- Each sentence leads with information-carrying words
- 80% of readers should get full value from layer 1 alone

**Law 3: Every Word Competes (Signal-to-Noise)**
- Extra content is not neutral — it's extraneous cognitive load
- Redundant information degrades comprehension (Redundancy Effect)
- Interesting-but-irrelevant details reduce learning (Seductive Details)
- The "completeness instinct" is the enemy of quality
- Cut until removing anything would lose information, then stop

### The Scope-Sensitivity Matrix

The expertise reversal effect + Diataxis + progressive disclosure converge on a key insight: **content selection must vary by scope/audience**.

| Document Scale | What to Include | What to Exclude |
|---------------|----------------|-----------------|
| **Quick (ADR)** | Decision + alternatives + consequences | Problem exploration, detailed analysis, background |
| **Standard** | Problem + decision + key trade-offs + risks | Implementation details, exhaustive alternatives, historical context |
| **Full** | All of Standard + detailed alternatives + implementation approach + review feedback | Tutorial content, how-to instructions, tangential research |

### The Anti-Verbosity Checklist (Research-Backed)

Each item maps to a specific research finding:

1. **Does the first paragraph contain the conclusion?** (Inverted Pyramid; NNG 2018)
2. **Can a reader stop after any section and still have the main point?** (Progressive Disclosure; Nielsen 2006)
3. **Are there ≤5 concepts per section?** (Working Memory; Cowan 2001)
4. **Does every section pass the "so what?" test?** (Signal-to-Noise; Eppler & Mengis 2004)
5. **Is any information presented in multiple formats?** (Redundancy Effect; Sweller 2003)
6. **Are there interesting-but-irrelevant details?** (Seductive Details; Harp & Mayer 1998)
7. **Would an expert find any section patronizing?** (Expertise Reversal; Kalyuga 2003)
8. **Do headings function as a standalone summary?** (Layer-Cake Pattern; NNG 2017)
9. **Is the document ≤50% the length of what the author's instinct suggests?** (Carroll 1990; Nielsen 1997)
10. **Are word budgets explicit and per-section?** (RLHF Verbosity; Singhal 2023)

---

## Verified Sources

| Source | Author(s) | Year | Verified URL |
|--------|-----------|------|-------------|
| Cognitive Load Theory (seminal) | John Sweller | 1988 | https://en.wikipedia.org/wiki/Cognitive_load |
| RLHF Length Bias | Singhal, Goyal, Xu, Durrett | 2023 | https://arxiv.org/abs/2310.03716 |
| How Users Read on the Web | Jakob Nielsen | 1997 | https://www.nngroup.com/articles/how-users-read-on-the-web/ |
| F-Shaped Pattern | Kara Pernice (NNG) | 2017 | https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/ |
| Progressive Disclosure | Jakob Nielsen | 2006 | https://www.nngroup.com/articles/progressive-disclosure/ |
| Inverted Pyramid | Amy Schade (NNG) | 2018 | https://www.nngroup.com/articles/inverted-pyramid/ |
| Chunking | Kate Moran (NNG) | 2016 | https://www.nngroup.com/articles/chunking/ |
| Diataxis Framework | Daniele Procida | 2017+ | https://diataxis.fr/ |
| The Nurnberg Funnel | John M. Carroll | 1990 | MIT Press (ISBN: 0-262-03163-2) |
| Magical Number Seven | George A. Miller | 1956 | *Psychological Review* |
| Working Memory Capacity | Nelson Cowan | 2001 | *Behavioral and Brain Sciences*, 24, 87-185 |
| Information Foraging | Pirolli & Card | 1999 | *Psychological Review* |
| Seductive Details | Harp & Mayer | 1998 | *Journal of Educational Psychology* |
| Expertise Reversal | Kalyuga, Ayres, Chandler, Sweller | 2003 | *Educational Psychologist*, 38(1) |
| Inverted Pyramid History | Horst Pöttker | 2003 | *Journalism Studies*, 4(4), 501-511 |
| Information Overload | Eppler & Mengis | 2004 | *The Information Society*, 20(5) |
| Communication Theory | Claude Shannon | 1948 | *Bell System Technical Journal* |
| Curse of Knowledge | Camerer, Loewenstein, Weber | 1989 | *Journal of Political Economy* |

---

## Applicability to the Design Skill

### What the Design Skill Already Gets Right
1. **Word budgets** (500-1000 standard, 1000-2500 full) — directly addresses RLHF verbosity
2. **Scale selector** (Quick/Standard/Full) — maps to expertise reversal / scope-sensitivity
3. **Anti-AI vocabulary** (17 banned words) — addresses LLM-specific verbosity patterns
4. **Compression protocol** (4 levels) — systematic noise reduction
5. **"So What?" test** — maps to signal-to-noise research
6. **BLUF principle** — maps to inverted pyramid research

### What the Research Suggests Could Be Improved
1. **Dynamic section selection** — The template includes 11 sections. Research suggests the agent should *select* which sections to include based on scope, not produce all 11 and compress. The expertise reversal effect says irrelevant sections hurt, not just waste space.
2. **Per-section word budgets are present but could be tighter** — Research suggests Standard should aim for the lower end of budgets. Carroll proved 70-75% content reduction improved performance.
3. **Progressive disclosure in the document itself** — The output template could explicitly mark "primary layer" (read this) vs "secondary layer" (details for those who want them).
4. **Heading quality** — Research strongly supports headings-as-standalone-summary. The ValidateOutput workflow checks for "Layer-Cake" but could enforce that headers alone tell the story.
5. **The "Background" section** — This is the classic seductive-details trap. Research suggests it should be last and optional, not a prominent section.
6. **Audience-aware rendering** — The expertise reversal effect suggests different rendering for different audiences (terse for experts, elaborated for cross-functional stakeholders). The skill could detect audience and adjust.
