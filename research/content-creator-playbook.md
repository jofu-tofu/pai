# The Content Creator Playbook: Research Compendium

## Purpose

This document synthesizes research from 7 parallel tracks into a comprehensive reference for updating PAI's **ClarityEngine** and **Design** skills. It distills ~650 rules from 50+ authoritative sources into actionable principles organized by domain.

**How to use this document:** Each section contains numbered, source-attributed rules ready for encoding. The final section maps research findings to specific gaps in the current ClarityEngine and Design skills, with recommended integration points.

---

## Table of Contents

1. [Cognitive Foundations](#1-cognitive-foundations) — The science of why these techniques work
2. [Information Architecture](#2-information-architecture) — Structuring content for comprehension
3. [Writing & Language](#3-writing--language) — Word-level and sentence-level craft
4. [Visual Design](#4-visual-design) — Layout, typography, color, whitespace
5. [Presentation Design](#5-presentation-design) — Slide decks and spoken delivery
6. [Data Visualization](#6-data-visualization) — Charts, tables, dashboards
7. [UX Writing & Content Patterns](#7-ux-writing--content-patterns) — Format-specific rules
8. [Gap Analysis & Integration Map](#8-gap-analysis--integration-map) — Where to apply this research

---

## 1. Cognitive Foundations

*Why* content creator techniques work, grounded in cognitive science. These principles underpin every subsequent section.

### 1.1 Cognitive Load Theory
*Source: Sweller (1988, 1994); Mayer (2009)*

The brain has a limited processing budget. Three types of load compete for it:

- **Intrinsic load** — inherent complexity of the material (irreducible)
- **Extraneous load** — load caused by poor presentation design (reducible)
- **Germane load** — load devoted to actual learning and understanding (maximize this)

**Rules:**

| # | Rule | Source |
|---|------|--------|
| C1 | Eliminate split attention. Never force the reader to mentally integrate two separate sources (e.g., a diagram here, its legend there). Integrate labels directly. | Sweller & Chandler (1994) |
| C2 | Use integrated formats. Place labels ON diagrams, headers WITHIN tables, step numbers INSIDE process flows. | Mayer, Spatial Contiguity Principle |
| C3 | Eliminate redundancy. Don't present identical information in text AND visual AND caption. Choose the optimal channel or use complementary (not duplicative) channels. | Mayer, Redundancy Principle |
| C4 | Segment complex information into discrete, learner-paced chunks. Each chunk = one complete idea. | Mayer, Segmenting Principle |
| C5 | Pre-train on vocabulary. Before presenting a complex system, introduce key terms individually so they're already in memory when the system is explained. | Mayer, Pre-training Principle |
| C6 | Signal structure explicitly. Use headings, bold, numbered lists, and visual hierarchy so the reader doesn't burn cognitive budget figuring out what's important. | Mayer, Signaling Principle |
| C7 | Remove extraneous elements. Every decorative image, tangential anecdote, or unnecessary animation either teaches or distracts. If removing it loses nothing, remove it. | Mayer, Coherence Principle |

### 1.2 Working Memory Constraints
*Source: Miller (1956); Cowan (2001); Baddeley (2000)*

Working memory holds ~4 items for complex information (Cowan revised Miller's 7+/-2 downward).

| # | Rule | Source |
|---|------|--------|
| C8 | Limit parallel items to 4 per group. Applies to: bullets per group, table columns, simultaneous options, steps shown at once. | Cowan (2001) |
| C9 | Chunk before presenting. 12 ungrouped items overwhelm; 3 groups of 4 labeled items are manageable. | Miller (1956); Chase & Simon (1973) |
| C10 | One new concept per slide/section. Supporting evidence follows, but don't interleave multiple novel ideas. | Sweller, element interactivity |
| C11 | Progressive disclosure. Reveal in layers: high-level structure first (3-4 items), then drill-down. Respects working memory at each level. | Nielsen Norman Group; Krug (2000) |
| C12 | Limit table columns to 4-5. Each column competes for a working memory slot during comparison. | Applied from Cowan; Hick's Law |
| C13 | Provide working memory scaffolds: summaries, running headers, "where we are" indicators. These offload tracking from brain to document. | Baddeley (2000) |

### 1.3 Attention
*Source: Nielsen (2006); Leroy (2009); Monsell (2003); Kahneman (1973)*

Attention is not a fixed resource (the "8-second span" is a myth). It is task-dependent and motivation-dependent. But it must be *earned*.

| # | Rule | Source |
|---|------|--------|
| C14 | Earn attention in the first paragraph. The opening must answer: "Why should I care?" and "What will I gain?" | Nielsen F-pattern studies (2006) |
| C15 | Insert pattern breaks every 500-800 words. A visual, a question, a story, a format change, a callout box. These reset the attention clock. | Bunce, Flens & Neiles (2010) |
| C16 | Lead with relevance. Self-relevant information captures attention preferentially. Use "you" language. Connect to the reader's known problems. | Moray (1959), cocktail party effect |
| C17 | Eliminate attention residue. Provide explicit closure on a topic before opening the next. Unfinished threads bleed into subsequent sections. | Leroy (2009); Zeigarnik effect |
| C18 | Minimize context-switching. Each topic shift imposes a 15-25% performance cost. Group related items; don't interleave unrelated topics. | Monsell (2003) |
| C19 | Use emotion as an attention anchor. Stakes, stories, and surprise maintain engagement through cognitively demanding sections. | Vuilleumier (2005); Kensinger (2009) |

### 1.4 Dual Coding Theory
*Source: Paivio (1971, 1986); Mayer (2001)*

Cognition uses two systems: verbal and imagistic. Information encoded in BOTH creates two retrieval pathways, roughly doubling recall.

| # | Rule | Source |
|---|------|--------|
| C20 | Pair every key concept with a visual. Verbal explanation + diagram/chart/icon. The two should be complementary, not redundant. | Paivio (1986); Mayer, Multimedia Principle |
| C21 | Use concrete language to trigger internal imagery. "A bridge between two islands" dual-codes automatically; "a functional relationship" does not. | Paivio, concreteness effect |
| C22 | Place text and images adjacent. Spatial contiguity between verbal and visual channels is required for dual coding to activate. | Mayer, Spatial Contiguity Principle |
| C23 | Use consistent icons as semantic anchors. Pair recurring concepts with the same icon every time. The icon becomes a visual retrieval cue. | Applied dual coding |
| C24 | Diagrams over text for processes. Spatial relationships are processed by the imagistic system with less effort than parsing verbal descriptions. | Larkin & Simon (1987) |
| C25 | Limit visual complexity. A diagram with >7-9 elements becomes as demanding as dense text. One diagram per relationship. | Mayer, Coherence Principle |

### 1.5 Memory Effects

| # | Rule | Source |
|---|------|--------|
| C26 | **Von Restorff (isolation) effect:** Make the ONE key takeaway visually distinct. Different color, callout box, larger font. If everything is highlighted, nothing is. | Von Restorff (1933) |
| C27 | Use highlight boxes sparingly. Max 1 per 500-800 words. More than that, they become the new baseline. | Applied Von Restorff |
| C28 | **Primacy effect:** Front-load the most important information. Don't "build up" to the key point — lead with it. | Murdock (1962) |
| C29 | **Recency effect:** End with the second most important point. Close each section with a strong, memorable statement. | Glanzer & Cunitz (1966) |
| C30 | **Bookend structure:** State the key claim at the opening (primacy), develop it in the middle, restate with added insight at the close (recency). Two encoding opportunities at the two strongest serial positions. | Applied serial position; classical rhetoric |
| C31 | Create multiple beginnings and endings. In long documents, break into sections each with its own strong opening and closing. This creates multiple primacy/recency peaks. | Applied from Ebbinghaus; Mayer Segmenting |
| C32 | **Picture superiority:** Images remembered 6x better than text at 72 hours. Convert key data to visual formats. Use meaningful images, not decorative ones. | Nelson, Reed & Walling (1976) |
| C33 | Captions are mandatory. Images without captions are processed visually but may not form the intended verbal association. Captions are among the most-read text elements. | Ogilvy (1985); Garcia & Stark (1991) |

### 1.6 Processing Fluency
*Source: Reber & Schwarz (1999); Oppenheimer (2008); Alter & Oppenheimer (2009)*

Ease of processing increases perceived truth, positive evaluation, and engagement.

| # | Rule | Source |
|---|------|--------|
| C34 | Use short sentences for key claims. Complex syntax reduces fluency and perceived truth. | Oppenheimer (2008) |
| C35 | Use high-frequency words. "Use" over "utilize." Familiar words are processed faster. | Alter & Oppenheimer (2009) |
| C36 | Choose legible fonts and adequate contrast. Font legibility directly affects processing fluency, which affects perceived truth. | Song & Schwarz (2008) |
| C37 | Left-align body text. Left-aligned is more fluent than justified (consistent word spacing) and center-aligned (ragged edges). | Gregory & Poulton (1970) |
| C38 | Maintain consistent visual patterns. Formatting inconsistency creates disfluency. Every deviation must earn its place by signaling meaningful difference. | Gestalt principles |
| C39 | Use concrete over abstract language. "Sales dropped 30% in Q3" is more fluent than "Revenue experienced significant declination." | Sadoski, Goetz & Rodriguez (2000) |
| C40 | Use familiar structures. Numbered lists for sequences, bullets for unordered sets, tables for comparisons, headers for sections. Novel structures impose "format decoding" cost. | Kintsch (1998) |

### 1.7 Spacing, Repetition, and Emotional Engagement

| # | Rule | Source |
|---|------|--------|
| C41 | Repeat key messages at spaced intervals. In documents >1500 words, the core message should appear 3+ times: intro, body (rephrased), conclusion. | Cepeda et al. (2006) |
| C42 | Restate, don't repeat verbatim. Varied repetition forces reprocessing and creates additional retrieval pathways. Verbatim repetition is skipped. | Bjork, desirable difficulties |
| C43 | Open with stakes. Before explaining what something IS, explain what happens if the reader gets it wrong or right. | Heath & Heath (2007), Made to Stick |
| C44 | Use concrete stories over abstract principles. "A surgeon left a sponge inside a patient" activates emotion and imagery. | Heath & Heath (2007) |
| C45 | Create curiosity gaps. Present a question before the answer. The information gap sustains attention until closed. | Loewenstein (1994) |
| C46 | Anchor abstract concepts to human consequences. "Every extra 200ms of latency costs Amazon $1.6B annually." | Kahneman (2011), System 1 processing |
| C47 | **Peak-end rule:** Experiences are remembered by their emotional peak and ending. Close with an inspiring call to action or compelling restatement — not logistics or disclaimers. | Kahneman et al. (1993) |

### 1.8 Meta-Principles

| # | Rule | Source |
|---|------|--------|
| C48 | **SUCCESs framework:** Sticky ideas are **S**imple, **U**nexpected, **C**oncrete, **C**redible, **E**motional, and use **S**tories. | Heath & Heath (2007) |
| C49 | **System 1 first, System 2 second.** Design for fast/automatic/intuitive before slow/deliberate/analytical. Visuals before text, concrete before abstract, familiar before novel, emotional before rational. | Kahneman (2011) |
| C50 | **The Curse of Knowledge is your primary enemy.** The creator's inability to reconstruct not-knowing is the single largest barrier to effective content. Every technique above is a countermeasure. | Camerer, Loewenstein & Weber (1989) |

---

## 2. Information Architecture

*How to structure information for maximum comprehension, regardless of format.*

### 2.1 Progressive Disclosure

| # | Rule | Source |
|---|------|--------|
| IA1 | Lead with the governing idea. Every document, section, and paragraph opens with its most important claim. Detail follows; it never precedes. | Minto, Pyramid Principle |
| IA2 | **Three-layer disclosure model.** Layer 1 (5-sec scan): title + TL;DR. Layer 2 (30-sec scan): headings + topic sentences. Layer 3 (deep read): full body. | NNGroup; Pernice (2017) |
| IA3 | Front-load every structural unit recursively. The first sentence of every paragraph is readable in isolation. The first paragraph of every section is readable in isolation. | Minto; Williams & Bizup |
| IA4 | Defer caveats, don't lead with them. Pattern: Claim -> Evidence -> Caveat. Exception: safety warnings. | Pinker, *The Sense of Style* |

### 2.2 Macro Structure Selection

| Structure | When to Use | Source |
|-----------|-------------|-------|
| **Inverted Pyramid** | News, status updates, exec summaries, anything readers may leave early | Journalism; NNGroup |
| **Narrative Arc (SCR/SCQA)** | Persuasion, case studies, presentations where you control attention | Heath brothers; Minto |
| **Modular/Hub-and-Spoke** | Reference docs, knowledge bases, docs where readers enter at arbitrary points | Rosenfeld & Morville |
| **Minto Pyramid** | Business documents requiring logical rigor. Answer first, then supporting arguments, then data. 3-5 MECE arguments. | Minto, *Pyramid Principle* |
| **Amazon 6-Pager** | Complex strategic decisions. Intro -> Goals -> Tenets -> State of Business -> Lessons -> Priorities. Prose, no bullets. | Bryar & Carr, *Working Backwards* |

### 2.3 Chunking

| # | Rule | Source |
|---|------|--------|
| IA5 | Limit parallel items to 3-5. The "Rule of Three" is a floor; 5 is a ceiling for complex items; 7 is the absolute max for simple items. | Miller (1956); Cowan (2001) |
| IA6 | Ideal paragraph: 3-5 sentences (40-120 words) for digital; max 8 sentences / ~150 words. | NNGroup; Ann Handley |
| IA7 | Ideal section: 200-500 words under an H2. Beyond 500, split into subsections. | Orbit Media; NNGroup |
| IA8 | One idea per chunk. Each paragraph = one idea. Each section = one topic. Each slide = one point. | Cognitive Load Theory |
| IA9 | Chunk labels are mandatory. Every chunk above paragraph-level gets a descriptive heading. Headings state conclusions, not topics. Bad: "Results." Good: "Revenue grew 34% driven by enterprise." | Minto; NNGroup |

### 2.4 Document Length Guidelines

| Format | Ideal | Maximum |
|--------|-------|---------|
| Email | 50-125 words | 200 words |
| Chat message | 1-3 sentences | 5 sentences |
| Executive summary | 200-400 words | 1 page |
| Memo | 1-2 pages | 6 pages (Amazon) |
| Blog post | 1,500-2,500 words | 4,000 words |
| Presentation slide | 25-50 words | 75 words |
| Slide deck | 10-20 slides | 30 slides / 30 min |

### 2.5 Hierarchy and Nesting

| # | Rule | Source |
|---|------|--------|
| IA10 | Maximum 3 heading levels for documents (H1 title, H2 sections, H3 subsections). H4+ signals over-nesting; restructure. | NNGroup; Rosenfeld & Morville |
| IA11 | **LATCH framework** — 5 ways to organize information: Location, Alphabet, Time, Category, Hierarchy. Choose ONE per level; don't mix. | Wurman, *Information Anxiety* |
| IA12 | Every heading level must have at least 2 siblings. A heading with one sub-section is a false hierarchy; merge or split. | Minto; outlining logic |
| IA13 | Headings must be parallel in structure. If one H2 is a question, all H2s should be questions. | Williams & Bizup |

### 2.6 Scannability

| # | Rule | Source |
|---|------|--------|
| IA14 | Design for the F-pattern. Place critical info in the first two paragraphs and make the first 2-3 words of every heading/bullet carry maximum information. | NNGroup F-pattern studies |
| IA15 | Design for the layer cake pattern. Clear, informative headings cause readers to jump heading-to-heading, diving into body text selectively. This is the BETTER scanning pattern; design to encourage it. | NNGroup, Moran (2019) |
| IA16 | Every document >500 words must open with a 2-5 sentence summary answering: What? So what? Now what? | NNGroup; Amazon; consulting standard |
| IA17 | Bold key phrases, not whole sentences. Max ~10% of text bolded. More creates "bold blindness." | NNGroup |
| IA18 | Front-load every line. The first 2-3 words of headings, bullets, and topic sentences carry the most information. | NNGroup, Nielsen (2009) |
| IA19 | Use lists for 3+ parallel items. Numbered for sequences; bulleted for unordered sets. | Redish (2007) |

### 2.7 Sequencing

| Reader's Question | Best Sequence |
|-------------------|---------------|
| "What should I know?" | Importance (inverted pyramid) |
| "What happened?" | Chronological |
| "What should I do?" | Procedural (step-by-step) |
| "What should I choose?" | Compare-contrast (matrix) |
| "Why should I care?" | Problem-solution (SCQA) |
| "How does this work?" | General-to-specific (progressive) |

| # | Rule | Source |
|---|------|--------|
| IA20 | **Given-New Contract.** Each sentence begins with known information ("given") and ends with new information. Each paragraph opens with a bridge from the previous paragraph. | Clark & Haviland (1977) |
| IA21 | Problem before solution, always. The reader must feel the problem's weight before appreciating the solution. | Heath brothers; Minto |
| IA22 | Ascending complexity within sections: simple -> complex, concrete -> abstract, familiar -> unfamiliar. | Cognitive Load Theory |
| IA23 | End sections with forward momentum: a bridge, an implication, or a mini-summary + call to action. Never end with a trailing detail or caveat. | Duarte, *Resonate* |

### 2.8 Repetition and Reinforcement

| # | Rule | Source |
|---|------|--------|
| IA24 | **Tell-Tell-Tell.** Tell them what you'll tell them (intro). Tell them (body). Tell them what you told them (conclusion). Non-optional for docs >1,000 words. | Classical rhetoric; Dale Carnegie |
| IA25 | Core message appears 3-5 times in different forms: title, TL;DR, body, callout/visual, conclusion. Each repetition uses different words and adds new context. | Heath brothers; advertising research |
| IA26 | **One Sticky Phrase.** Distill the core message into 6-12 words. This phrase IS repeated verbatim — it's the anchor. | Heath brothers, "Commander's Intent" |
| IA27 | Use consistent terminology. Once you choose a term, use it everywhere. "Users" and "customers" are not interchangeable if they mean the same group. | Krug; API doc standards |

### 2.9 Entry Points and Exit Points

| # | Rule | Source |
|---|------|--------|
| IA28 | Design 5+ entry points per long document: title, subtitle, TL;DR, headings, callouts, diagrams, conclusion. | Magazine design; NNGroup |
| IA29 | **Helicopter test.** A reader who reads ONLY the title, headings, and first sentence of each section should reconstruct the main argument. | McKinsey |
| IA30 | Every H2 section must be semi-autonomous. Open with enough context to stand alone; don't rely on "the above." | Rosenfeld & Morville |
| IA31 | Key messages at exit points: end of each section, end of document, end of each page, and image captions (high-fixation zones). | Serial position effect; NNGroup |
| IA32 | **Random Access test.** Open to any page — can you determine what section, what it's about, and what the document is about? | Krug; Rosenfeld & Morville |
| IA33 | Multiple formats for critical messages. Present the same information as text, visual, and summary. Triples landing probability. | Mayer, Multimedia Principle |

---

## 3. Writing & Language

*Word-level and sentence-level craft for maximum clarity and engagement.*

### 3.1 Headlines and Hooks

| # | Rule | Source |
|---|------|--------|
| W1 | Five times as many people read the headline as the body. The headline's only job is to get the first sentence read. | Ogilvy |
| W2 | **4 U's Formula.** Score each headline: Useful, Urgent, Ultra-specific, Unique. Aim for 3+/4. | Copyblogger / AWAI |
| W3 | Headlines with numbers outperform. Odd numbers outperform even. Use digits (7) not words (seven). | Conductor research |
| W4 | Front-load the benefit or keyword. First 3 words carry disproportionate weight. | NNGroup; Ogilvy |
| W5 | Curiosity gap: provide enough to intrigue, withhold the resolution. "I spent $10K testing headlines. One technique outperformed everything." | Loewenstein; Copyhackers |
| W6 | Pattern interrupts: counterintuitive claims, unexpected juxtaposition, breaking the fourth wall. | Halbert; Copyhackers |

### 3.2 Opening Lines

| # | Rule | Source |
|---|------|--------|
| W7 | First sentence purpose: get the second sentence read. If it doesn't compel forward, nothing else matters. | Sugarman |
| W8 | Make the first sentence short. Under 8 words is ideal. | Roy Peter Clark |
| W9 | Never open with throat-clearing. If the piece works without the first paragraph, cut it. | Handley; Shapiro |
| W10 | **PAS framework** for problem-aware audiences: Problem (name the pain) -> Agitate (twist the knife) -> Solve (present relief). | Dan Kennedy; Copyhackers |
| W11 | **Cold open / in medias res:** Start in the middle of the action. "The email landed at 2 AM. By morning, the company had lost $4 million." | Halbert; narrative journalism |
| W12 | **Specificity lead:** Open with an absurdly specific detail. "At 3:42 PM on a Tuesday..." Specific details trigger trust. | Halbert; Claude Hopkins |

### 3.3 Sentence and Paragraph Craft

| # | Rule | Source |
|---|------|--------|
| W13 | Vary sentence length deliberately. Follow a long sentence with a short one. The short one hits hard because of contrast. | Roy Peter Clark; Gary Provost |
| W14 | Average sentence length: 14-18 words. But individual sentences should range from 3 to 35 words. | Henneke Duistermaat |
| W15 | One-sentence paragraphs are essential on screens. 1-3 sentences per paragraph for digital. | Copyblogger; Copyhackers |
| W16 | End paragraphs with strength. The last word carries the most weight — it's what readers carry into the white space. | Roy Peter Clark |
| W17 | **Bucket brigades.** Short transitional phrases that pull readers forward: "Here's the thing:" / "But wait." / "The bottom line?" Place them where attention naturally dips. | Brian Dean; Copyblogger |
| W18 | Rule of Three in inline lists. Three items create completeness and rhythm. Two feels incomplete. Four feels excessive. | Classical rhetoric |
| W19 | **Ladder of abstraction.** Alternate between abstract statements and concrete examples. Never stay at one level for more than 2-3 sentences. | Roy Peter Clark |

### 3.4 Vocabulary

| # | Rule | Source |
|---|------|--------|
| W20 | Prefer concrete, specific words over abstract, general ones. "German Shepherd" over "dog." "37%" over "many." | Roy Peter Clark; Heath brothers |
| W21 | Use sensory language. Words that trigger sight, sound, touch, smell, taste create mental imagery and increase retention. | Henneke Duistermaat |
| W22 | Target Flesch-Kincaid grade 6-8 for general audiences. Hemingway wrote at grade 4. Most bestsellers score grade 5-7. | Flesch readability research |
| W23 | Prefer Anglo-Saxon words over Latinate: "help" not "facilitate," "use" not "utilize," "start" not "commence," "buy" not "purchase." | Orwell, "Politics and the English Language" |
| W24 | **Mom test / bar test:** If you couldn't say this to a stranger at a bar without them asking "what do you mean?", rewrite it. | Ann Handley |
| W25 | Replace nominalizations with verbs: "implementation of" -> "implement." "Give consideration to" -> "consider." Nominalizations drain energy. | Helen Sword; Roy Peter Clark |
| W26 | Cut filler words: really, very, just, quite, rather, somewhat, basically, actually, literally, simply. | Henneke Duistermaat; Handley |
| W27 | Use power verbs over adverb + weak verb: "sprinted" not "ran quickly." "Plummeted" not "decreased significantly." | Henneke Duistermaat |

### 3.5 Voice and Tone

| # | Rule | Source |
|---|------|--------|
| W28 | Write one level less formally than you think you should. Corporate does not equal credible. | Ann Handley; Copyhackers |
| W29 | Active voice by default. >90% active in marketing; >80% in business documents. Passive only for unknown actors, object emphasis, or diplomatic ambiguity. | Strunk & White; universal |
| W30 | Use "you" relentlessly. "You:we" ratio should be at least 2:1. | Copyblogger; Copyhackers |
| W31 | Use contractions. "You're," "it's," "don't." Leave uncontracted only for emphasis: "Do not ignore this." | Handley; Copyblogger |
| W32 | Start sentences with "And," "But," "So," "Because." Grammatically acceptable; creates conversational flow. | Roy Peter Clark; modern style guides |
| W33 | **Coffee shop test:** Read aloud. If you'd never say it across a table, rewrite it. | Handley; Duistermaat |

### 3.6 Persuasion Patterns

| # | Rule | Source |
|---|------|--------|
| W34 | **Reciprocity:** Give value before asking. Lead with your best content, not a gate. | Cialdini |
| W35 | **Social proof:** Specific > vague. "47,328 marketers" beats "thousands." Always include numbers. | Cialdini; Copyhackers |
| W36 | **Authority:** Signal with specifics, not claims. "After analyzing 11,493 headlines" beats "As an expert." Show, don't tell. | Cialdini |
| W37 | Specific numbers are more believable than round numbers. "34.7%" more credible than "35%." | Heath, Made to Stick |
| W38 | Frame consequences as losses, not gains. "Stop losing $X" outperforms "Start saving $X." Loss aversion is ~2x stronger than gain seeking. | Kahneman & Tversky |
| W39 | Name objections before the reader thinks them. "You might be thinking: 'I don't have time for this.'" Then address directly. | Inoculation theory; Copyhackers |
| W40 | Describe the reader's problem in more vivid detail than they could themselves. When they think "that's EXACTLY how I feel," trust is earned. | Copyhackers, voice-of-customer research |

### 3.7 Editing Rules

| # | Rule | Source |
|---|------|--------|
| W41 | After writing, cut 20-30% of the words. Cut adjectives first, adverbs second, then unnecessary clauses. | Handley; Shapiro; editing consensus |
| W42 | **Highlight test:** Print and highlight every sentence that directly serves the reader. Cut or rewrite unhighlighted sentences. | Ann Handley |
| W43 | Read aloud. Every stumble signals a sentence that needs rewriting. Your ear catches what your eye misses. | Roy Peter Clark; universal |
| W44 | **"So what?" test** applied recursively. "Revenue grew 15%." -> So what? -> "Exceeds 10% target." -> So what? -> "We can accelerate investment." -> THAT's the real message. | Minto; McKinsey; Shapiro |

### 3.8 Plain Language Reference

| Instead of | Write |
|------------|-------|
| utilize / leverage | use |
| implement | set up, create, build |
| facilitate | help, enable |
| in order to | to |
| due to the fact that | because |
| at this point in time | now |
| in the event that | if |
| commence | start, begin |
| terminate | end, stop |
| prior to | before |
| it should be noted that | (omit) |
| please be advised that | (omit) |
| robust / scalable / cutting-edge | (replace with specific claim) |

*Sources: GOV.UK, plainlanguage.gov, Microsoft Style Guide, Google Developer Docs*

---

## 4. Visual Design

*Layout, typography, color, and whitespace rules for documents and presentations.*

### 4.1 Visual Hierarchy

| # | Rule | Source |
|---|------|--------|
| V1 | Minimum 1.5x size ratio between hierarchy levels (ideal: 1.618x golden ratio). | Refactoring UI |
| V2 | Most important element 2-3x larger than surroundings. | Canva Design School |
| V3 | Combine size + weight + color for hierarchy. Don't rely on size alone. | Refactoring UI |
| V4 | Limit to 3 hierarchy levels per view: primary (title), secondary (subhead), tertiary (body). | Tufte |
| V5 | Use a type scale with consistent ratios: 1.25 (Major Third), 1.333 (Perfect Fourth), or 1.5 (Perfect Fifth). | Tim Brown, A List Apart |
| V6 | **Squint test:** Squint at your design. If you can't tell what's most important, hierarchy has failed. | Visme |
| V7 | Top-left = prime real estate in LTR layouts. Place the most critical information there. | NNGroup |
| V8 | Isolate the most important element with whitespace. Space draws more attention than size. | Tufte |
| V9 | Proximity = relationship (Gestalt). Use 1.5x inter-item spacing minimum to separate unrelated groups. | Gestalt; Smashing Magazine |
| V10 | Vertical rhythm: 8px base unit. Use 8, 16, 24, 32, 48, 64 — never arbitrary values. | Material Design |

### 4.2 Typography

| # | Rule | Source |
|---|------|--------|
| V11 | Maximum 2 typefaces. Pair by contrast (serif + sans-serif), not similarity. | Canva; Refactoring UI |
| V12 | When in doubt, use one font family with weight variation (Light/Regular/SemiBold/Bold). | Refactoring UI |
| V13 | Body text: 16-18px screen, 10-12pt print. Below 16px causes eye strain on screens. | WCAG; Smashing Magazine |
| V14 | Line height: 1.4-1.6x font size for body. Headings tighter: 1.1-1.3x. | Bringhurst; Butterick |
| V15 | Line length: 45-75 characters (ideal: 65). Single biggest readability factor. | Bringhurst; A List Apart |
| V16 | Max 3 font weights: Regular (400), SemiBold (600), Bold (700). | Canva |
| V17 | ALL CAPS only for 1-3 word labels, with 0.05-0.1em letter-spacing. Reduces reading speed 13-20%. | NNGroup; Tinker research |
| V18 | Sentence case for headings (20% faster to read than Title Case). | Smashing Magazine; GOV.UK |

### 4.3 Color

| # | Rule | Source |
|---|------|--------|
| V19 | **60-30-10 rule:** 60% dominant neutral, 30% secondary, 10% accent. | The Futur; Flux Academy |
| V20 | One bold accent color per composition for the primary focal point. Everything else neutral or muted. | The Futur |
| V21 | Generate 9 shades per color (50-900). Use 50-200 for backgrounds, 500-600 for primary, 700-900 for text. | Refactoring UI; Tailwind |
| V22 | Text hierarchy via shade: primary #1a1a1a-#333, secondary #666, tertiary #999. Never pure #000 (too harsh). | Refactoring UI |
| V23 | WCAG AA minimum: 4.5:1 for body text, 3:1 for large text. AAA: 7:1 body. | WCAG 2.1 |
| V24 | Never rely on color alone to convey information. Pair with icon, pattern, label, or position. 8% of men have color vision deficiency. | WCAG 2.1 |
| V25 | Highlight by de-emphasizing everything else. A black element among grays pops without garish color. | Refactoring UI |
| V26 | Color encodes meaning, not decoration. Every color has a purpose: primary action, success, warning, error, neutral. | Tufte |

### 4.4 Whitespace

| # | Rule | Source |
|---|------|--------|
| V27 | Content occupies 40-60% of available space. Slides never more than 50% filled. | Reynolds, *Presentation Zen* |
| V28 | Margin between unrelated sections: 2-3x spacing between related items. | Gestalt Proximity; Refactoring UI |
| V29 | More space above a heading than below (2x). This attaches the heading to its content. | Butterick; Material Design |
| V30 | Remove borders; use whitespace instead. Borders are a crutch. Separate with spacing or subtle background color (#fff vs #f8f9fa). | Refactoring UI |
| V31 | Data-ink ratio: maximize ink for data, minimize non-data ink. If removing an element loses nothing, remove it. | Tufte |

### 4.5 Layout

| # | Rule | Source |
|---|------|--------|
| V32 | 12-column grid for documents, 6-column for slides. Align everything to the grid — no exceptions. | Bootstrap; Muller-Brockmann |
| V33 | F-pattern for text-heavy pages; Z-pattern for CTA-driven pages/slides. | NNGroup; Smashing Magazine |
| V34 | Rule of thirds for slides. Place focal elements at grid intersections, not dead center. | Photography; Reynolds |
| V35 | Left-align body text. Never center-align more than 3 lines. Never justify on screens. | Butterick; Smashing Magazine |
| V36 | Single-column layout for readability (max 720px / 65ch). Two-column only for reference material. | A List Apart; Butterick |
| V37 | Consistent margins: minimum 10% of page width on each side. | Typography best practices |
| V38 | Visual rhythm through repetition. Same layout pattern (icon-title-description cards) reduces cognitive load — readers learn it once. | Gestalt, Law of Similarity |

### 4.6 Images and Icons

| # | Rule | Source |
|---|------|--------|
| V39 | One hero image per slide/section. Multiple competing images dilute attention. Hero >=40% of layout area. | Duarte, *Slide:ology* |
| V40 | Icons replace labels only when universally understood (search=magnifying glass, settings=gear). Otherwise, pair icon + label. | NNGroup |
| V41 | Consistent icon style: all outline OR all filled, same stroke weight. Mixing breaks coherence. | Material Design |
| V42 | Decorative icons get muted color; interactive/meaningful icons get accent color. | Refactoring UI |
| V43 | Data viz preference hierarchy: (1) table for exact values, (2) bar for comparisons, (3) line for trends, (4) pie only for 2-3 segments. Never 3D. | Tufte; Few |
| V44 | Every visual must have a purpose. "If I remove this, is information lost?" If no, remove it. | Tufte |

### 4.7 Quick Reference: Specific Values

```
TYPOGRAPHY
  body_font_size:        16-18px (screen), 10-12pt (print)
  heading_scale_ratio:   1.25 | 1.333 | 1.5
  line_height_body:      1.5 (safe default)
  line_height_heading:   1.2
  line_length:           65 characters (+/-10)
  paragraph_spacing:     1.0x line height
  max_typefaces:         2
  max_weights:           3 (400, 600, 700)

SPACING (8px base unit)
  xs: 4px     sm: 8px     md: 16px
  lg: 24px    xl: 32px    2xl: 48px    3xl: 64px

COLOR
  primary_text:    #1a1a1a to #333333
  secondary_text:  #4a5568 to #666666
  tertiary_text:   #999999 to #a0aec0
  background:      #FFFFFF
  surface:         #F7FAFC to #F8F9FA
  accent:          ONE saturated color (500 from 9-shade scale)
  ratio:           60% neutral / 30% secondary / 10% accent

CONTRAST (WCAG)
  body_text_min:   4.5:1
  large_text_min:  3:1
  aaa_body:        7:1

LAYOUT
  slide_fill:           40-50% max
  margins:              >=10% of width
  max_content_width:    720px / 65ch
  grid:                 12-col (docs), 6-col (slides)
```

---

## 5. Presentation Design

*Slide decks, spoken delivery, and deck archetypes.*

### 5.1 Narrative Structure

| # | Rule | Source |
|---|------|--------|
| P1 | **Sparkline structure.** Alternate between "what is" (current state) and "what could be" (future state). Each swing creates tension and release. End on "the new bliss" — higher than any previous peak. | Duarte, *Resonate* |
| P2 | **The audience is the hero, not the speaker.** The presenter is Yoda, not Luke. Frame so the audience is the protagonist who must choose to act. | Duarte, *Resonate* |
| P3 | Create a **Big Idea statement**: "[Audience] should [action] because [stakes]." If you can't write it, you don't have a presentation. | Duarte, *Resonate* |
| P4 | Every presentation has a **S.T.A.R. moment** — Something They'll Always Remember. One dramatic, memorable moment. Design it deliberately. | Duarte, *Resonate* |
| P5 | **SCR structure** (McKinsey default): Situation -> Complication -> Resolution. Lead with the answer. | Minto; McKinsey |
| P6 | **Throughline test** (TED): State your throughline in <=15 words. Every element must connect back. If a section doesn't serve it, remove it. | Chris Anderson |
| P7 | **One idea per talk** (TED). Not three related ideas — one, fully developed. | Chris Anderson |

### 5.2 Slide Design

| # | Rule | Source |
|---|------|--------|
| P8 | One idea per slide. If you have to say "and also," split it. | Universal (Duarte, Reynolds, Tufte) |
| P9 | **Three-second rule.** A slide communicates its message within 3 seconds. If longer, it's too complex. | Duarte, *Slide:ology* |
| P10 | **Billboard test.** Would this work as a highway billboard at 65 mph? | Reynolds, *Presentation Zen* |
| P11 | **Action titles.** Every slide title is a complete sentence stating the takeaway, not a topic label. "Q3 revenue grew 12% driven by enterprise" not "Q3 Revenue." | Minto; McKinsey |
| P12 | **Title-only test.** Read all slide titles in sequence. They should form a coherent executive summary. | McKinsey |
| P13 | Slides are not documents. If slides work as a standalone doc, they're too dense to present. | Duarte, *Slide:ology* |
| P14 | **Ghost deck method.** Before analysis, create a skeleton with action titles only. This forces top-down thinking. | McKinsey |

### 5.3 Visual Rules for Slides

| # | Rule | Source |
|---|------|--------|
| P15 | Full-bleed images over clip art. No stock cliches (handshakes, globes, puzzle pieces). | Reynolds |
| P16 | Target 6 words or fewer per slide for maximum impact. | Reynolds |
| P17 | Minimum 30pt font (Kawasaki rule). If it doesn't fit, there's too much text. | Kawasaki 10/20/30 |
| P18 | One typeface, two weights. Sans-serif for slides. | Reynolds |
| P19 | Animation only to reveal sequence. Cut or fade (0.3-0.5s) between slides. Zero decorative transitions. | Universal consensus |
| P20 | Build complexity gradually across 3-4 slides rather than showing complex diagram on one. | Duarte |
| P21 | Dark backgrounds for projected (dark rooms); light for printed/shared. | Design standard |
| P22 | 3-5 color palette max. Each color means something. | Duarte; data viz standard |

### 5.4 Opening and Closing

| # | Rule | Source |
|---|------|--------|
| P23 | **Never open with an agenda slide.** Open with a hook: surprising fact, customer quote, problem, or question. Agenda goes slide 3-4 (if at all). | Reynolds, Duarte, Anderson |
| P24 | **Never open with logo and company history.** Logo slides signal "this is about me, not you." | Raskin; Kawasaki |
| P25 | Establish stakes in the first 60 seconds: why it matters, why to them, what to do about it. | Duarte, *Resonate* |
| P26 | **End with a clear ask or takeaway, not "Questions?"** Last slide = specific ask, call to action, or vivid restatement. | Universal |
| P27 | **Callback close.** Reference the opening story/data and show how it's resolved. Creates narrative closure. | Anderson; Duarte |
| P28 | Have a closing slide ready to return to AFTER Q&A. Last image = your takeaway, not a question mark. | Reynolds; Duarte |

### 5.5 Deck Archetypes

**Pitch Deck (Sequoia Format, 10-15 slides):** Purpose -> Problem -> Solution -> Why now -> Market -> Product -> Business model -> Competition -> Team -> Financials -> Ask

**Board Deck:** Exec summary (1-2) -> KPI dashboard (1, consistent format) -> Functional updates (2-3 each) -> Decisions needed -> Appendix

**Sales Deck:** Problem -> Solution -> Proof (case studies, ROI) -> Ask. Name the enemy. Open with the "promised land" (a shift in the customer's world).

**Technical:** Code max 10 lines, syntax highlighted, 20pt+. Architecture diagrams max 7 boxes. Live demos: have a backup video.

**Status Update:** RAG dashboard + one sentence per item. Lead with blockers and decisions needed. If everything is green and no decisions needed, it should be an email.

### 5.6 Density Budgeting

| # | Rule | Source |
|---|------|--------|
| P29 | Slide count is irrelevant; cognitive load per slide is everything. 60 well-paced slides > 15 dense ones. | Duarte; Reynolds |
| P30 | **Match density to distribution.** Live presentation: minimal slide text, heavy speaker notes. Emailed/async: more text, approaching "slidedoc" density. | Duarte |
| P31 | Speaker notes are the "prose layer." Full argument in notes; visual anchor on slide. | Synthesis |
| P32 | Executive summary slides at front. Senior executives may read only these. Appendix for detailed analysis. | McKinsey |
| P33 | Section dividers between major topics. Page-number every slide. | McKinsey |

### 5.7 Amazon's Anti-PowerPoint Lesson

| # | Rule | Source |
|---|------|--------|
| P34 | PowerPoint hides sloppy thinking behind formatting. Bullets don't demand logical connectives (because, therefore, however). Prose does. | Bezos; *Working Backwards* |
| P35 | Use prose when the argument requires logical rigor. Use slides when content is primarily visual or for large audiences. | *Working Backwards*; synthesis |
| P36 | A good 6-pager takes weeks, not hours. The difficulty is a feature — it forces clear thinking. | *Working Backwards* |

---

## 6. Data Visualization

*Charts, tables, and dashboards.*

### 6.1 Tufte's Principles

| # | Rule | Source |
|---|------|--------|
| D1 | Maximize data-ink ratio. If removing an element loses no information, remove it. | Tufte |
| D2 | Eliminate chartjunk: 3D effects, background images, decorative icons, heavy gridlines, gradient fills. | Tufte |
| D3 | Grid lines (if used) must be muted: light gray, thin. They're reference, not data. | Tufte |
| D4 | Use small multiples for comparisons across a variable. Same structure, only data changes. Identical scales. | Tufte |
| D5 | **Lie Factor** = (size of effect in graphic) / (size of effect in data). Must be ~1.0. | Tufte |
| D6 | Bar chart y-axes always start at zero. Truncated baselines exaggerate differences. | Tufte; Few |
| D7 | Area encodings scale by area, not radius. Doubling value = doubling area, not radius. | Tufte |

### 6.2 Storytelling with Data (Knaflic)

| # | Rule | Source |
|---|------|--------|
| D8 | Every chart has a **Big Idea** — a single sentence: what to know/do, what's at stake, why to care. Write it before designing the chart. | SWD |
| D9 | **Gray everything, highlight what matters.** Default all data to gray. ONE accent color for the data supporting your Big Idea. | SWD |
| D10 | **"Where are your eyes drawn?" test.** Look away, look back. First focus should be the most important data. | SWD |
| D11 | Active titles, not descriptive. "Revenue doubled since product launch in Q3 2022" not "Monthly Revenue, 2020-2024." | SWD; Datawrapper |
| D12 | Two-level title: bold active title (insight) + smaller subtitle (data description). | Datawrapper |
| D13 | Data story = Setup (context) -> Conflict (what changed) -> Resolution (what to do). | SWD |

### 6.3 Chart Type Selection

| Relationship | Chart Type | Source |
|-------------|-----------|--------|
| Comparison among items | Bar (horizontal for many categories) | FT Visual Vocabulary |
| Comparison over time | Line | FT Visual Vocabulary |
| Part-to-whole | Stacked bar, treemap, or state the percentage | FT Visual Vocabulary |
| Distribution | Histogram, density, box plot | FT Visual Vocabulary |
| Correlation | Scatter | FT Visual Vocabulary |
| Change between 2 periods | Slope chart | Tufte; SWD |
| Before/after composition | Waterfall | FT Visual Vocabulary |
| Actual vs target | Bullet chart (Few's invention) | Few |

| # | Rule | Source |
|---|------|--------|
| D14 | Sort bar charts by value (largest-smallest) unless inherent order exists. Alphabetical sort is almost never useful. | Datawrapper |
| D15 | Limit line charts to 4-5 lines. Beyond that, use small multiples or highlight + gray the rest. | SWD; Few |
| D16 | **Avoid pie charts.** Humans are poor at comparing angles. Bar chart almost always better. If you must: max 2-3 slices. Never 3D pie. | Few; Tufte; Cairo |
| D17 | Use a table when: audience needs exact values, data has mixed units, <5 data points, or precision > pattern. | Few; SWD |
| D18 | Format tables: right-align numbers, left-align text, align decimals, light horizontal rules, no vertical rules. | Few; Dona Wong |

### 6.4 Annotation and Labeling

| # | Rule | Source |
|---|------|--------|
| D19 | Direct labeling over legends. Labels next to data eliminate eye-bounce. Color labels to match series. | SWD; Datawrapper |
| D20 | Annotate key moments directly on chart: events, anomalies, inflection points. Brief (1-2 sentences). | Amanda Cox, NYT |
| D21 | Always label axes, but remove axis titles when title/subtitle makes units clear. | SWD; Few |
| D22 | Human-readable numbers: "1.2M" not "1,200,000." "Q3 2024" not "2024-07-01." | Dona Wong |
| D23 | Reduce decimal places to decision-relevant precision. "23%" usually better than "23.3758%." | SWD |

### 6.5 Color in Data Viz

| # | Rule | Source |
|---|------|--------|
| D24 | Sequential palette (light-to-dark single hue) for ordered data. | Brewer, ColorBrewer |
| D25 | Diverging palette (two hues, neutral midpoint) for data with meaningful center. | Brewer |
| D26 | Categorical palette (distinct hues) for unordered categories. Max ~8 colors. | Brewer |
| D27 | Never rainbow palette. Not perceptually uniform, fails for colorblind. Use viridis or Brewer. | Borland & Taylor |
| D28 | Design for colorblindness. Blue-orange safe default. Test with simulator. Add redundant encoding if needed. | Datawrapper |
| D29 | Consistent color across a report. If "Product A" is blue on one chart, it's blue everywhere. | Few |

### 6.6 Simplification

| # | Rule | Source |
|---|------|--------|
| D30 | Remove chart borders, background fills, 3D effects, secondary gridlines, and plot area backgrounds. | SWD; Tufte |
| D31 | Avoid dual y-axes. Confusing, manipulable. Use two charts or index to common baseline. | Few |
| D32 | Consistent scales across charts being compared. Different y-axis ranges create false comparisons. | Few; Tufte |
| D33 | Round to meaningful precision. Consistent decimal places within the same chart. | Dona Wong; SWD |

### 6.7 Context and Comparison

| # | Rule | Source |
|---|------|--------|
| D34 | **"Compared to what?"** A number without context is meaningless. Always provide: prior period, target, benchmark, or peer group. | Few |
| D35 | Show the reference value explicitly. Don't rely on audience memory. Add reference lines, comparison bars, or annotations. | SWD; Few |
| D36 | When showing percentage changes, also provide absolute numbers. "Up 200%" means different things for 1->3 vs 1M->3M. | Cairo |
| D37 | Show both level and change when possible: "Revenue reached $4.2M (+12% YoY)." | FT practice |

### 6.8 Dashboards

| # | Rule | Source |
|---|------|--------|
| D38 | **5-second rule.** Most important insight graspable in 5 seconds. Use large KPI numbers (BANs) with comparison. | Few |
| D39 | Inverted-pyramid layout. Most important top-left. Supporting detail below and right. | Few |
| D40 | Single screen, no scrolling (for monitoring dashboards). If scrolling needed, it's a report. | Few |
| D41 | **Shneiderman's mantra:** Overview first, zoom and filter, then details-on-demand. | Shneiderman (1996) |
| D42 | Every dashboard needs a purpose statement: "Helps [audience] monitor [metrics] to make [decisions]." | Few |

### 6.9 AI Agent Chart Checklist

Every generated chart must pass:

- [ ] Title states the insight (not describes the chart)?
- [ ] Y-axis starts at 0 (bar charts)?
- [ ] Fewer than 5 colors?
- [ ] Context provided (comparison, benchmark, trend)?
- [ ] Key message understandable in 5 seconds?
- [ ] Gridlines minimal or absent?
- [ ] Direct labeling (no legend where possible)?
- [ ] Numbers rounded to appropriate precision?
- [ ] Simplest chart type that works?
- [ ] Source line present?

---

## 7. UX Writing & Content Patterns

*Plain language, readability, inclusive language, and format-specific rules.*

### 7.1 Plain Language Core

| # | Rule | Source |
|---|------|--------|
| U1 | Target reading age of 9 / grade 6-8 / Flesch 60-70 for general audiences. | GOV.UK; plainlanguage.gov |
| U2 | Sentences max 25 words. Average 15-20 words. | GOV.UK |
| U3 | Paragraphs max 3-4 sentences on screen. | GOV.UK; NNGroup |
| U4 | "Must" for obligations, "should" for recommendations. Never "shall" (ambiguous). | plainlanguage.gov |
| U5 | No double negatives. Each negative adds a mental inversion step. | plainlanguage.gov |
| U6 | Structure by user need, not org chart. | GOV.UK; Sarah Richards |
| U7 | Use the words users use. Check search data. Match mental models. | GOV.UK |

### 7.2 Content Design (Sarah Richards)

| # | Rule | Source |
|---|------|--------|
| U8 | **Two-second test.** Glance 2 seconds: know what page is about, if it's relevant, what to do next. | Richards, *Content Design* |
| U9 | Start with user needs, not organizational needs. Format: "As a [user], I need [thing] so that [outcome]." | Richards |
| U10 | Reduce, don't just rewrite. First ask "can we remove this?" | Richards |
| U11 | One page, one purpose. If purpose needs "and" to describe, split. | Richards |
| U12 | Design for the most common path first. 80% of users need 20% of content. Edge cases go in expandable sections. | Richards |

### 7.3 Voice and Tone Systems (Podmajersky)

| # | Rule | Source |
|---|------|--------|
| U13 | **Voice chart:** Define 3-5 dimensions. Each has "We are..." and "But not..." with examples. | Podmajersky, *Strategic Writing for UX* |
| U14 | Voice is constant; tone varies by context (celebratory for success, empathetic for error, neutral for settings). | Podmajersky |
| U15 | Create content patterns for every recurring type (buttons, errors, tooltips, empty states, confirmations). | Podmajersky |
| U16 | **Terminology matrix:** For each concept: internal name, user name, competitor name, chosen name, rationale. Prevents synonym drift. | Podmajersky |

### 7.4 Microcopy (Yifrah)

| # | Rule | Source |
|---|------|--------|
| U17 | **Error message formula:** What happened -> Why -> How to fix it. Never blame the user. Always provide a next step. | Yifrah |
| U18 | Empty states are onboarding opportunities. Include CTA + value explanation. | Yifrah |
| U19 | Confirmation dialogs: buttons match the action ("Delete / Keep" not "OK / Cancel"). | Yifrah |
| U20 | Reduce anxiety at the point of action: "No credit card required," "You can change this later." | Yifrah |
| U21 | Don't use "oops." It trivializes the user's problem. | Yifrah |
| U22 | CTA buttons start with a verb: "Get," "Start," "Download," "Join." Never "Submit" or "Click here." | Copyhackers; Yifrah |
| U23 | First person on buttons outperforms second person: "Get My Report" > "Get Your Report." | ContentVerve A/B test |

### 7.5 Readability Targets

| Audience | Grade Level | Flesch RE |
|----------|-------------|-----------|
| General public | 6-8 | 60-70 |
| Health/patient-facing | 5-6 | 70-80 |
| GOV.UK | 3-4 (reading age 9) | 80+ |
| B2B professional | 8-10 | 50-60 |
| Technical (developers) | 10-12 | 40-50 |
| Academic/legal | 12-16 | 30-50 |

**Techniques to lower reading level:** Shorten sentences (biggest factor), replace polysyllabic words, use active voice, cut prepositional chains, remove hedge words, use pronouns, break up walls of text.

### 7.6 Inclusive Language

| # | Rule | Source |
|---|------|--------|
| U24 | Gender-neutral by default. "They/them" for singular unknown. "Sales representative" not "salesman." | Microsoft; Google |
| U25 | Avoid ableist language. "Review" not "sanity check." "Placeholder" not "dummy." "Final check" not "blind review." | Microsoft; Google |
| U26 | Avoid idioms for international audiences. "Straightforward" not "piece of cake." | Microsoft |
| U27 | Avoid violent metaphors. "Stop the process" not "kill it." "Allowlist" not "whitelist." "Primary/replica" not "master/slave." | Google; Microsoft; IETF |
| U28 | Don't use "normal" to mean "default." | Microsoft |
| U29 | Use diverse names in examples. International date formats or explicit ("15 March 2024" not "3/15/24"). Leave room for text expansion (German +30%). | Microsoft; i18n best practices |

### 7.7 Format-Specific Content Patterns

**Executive Summaries:**
- Lead with decision or recommendation (first sentence)
- Max 10% of full document length
- Include: situation, finding, recommendation, next step
- Stand-alone readable; no new information beyond what's in the full doc

**Bullet Lists:**
- Parallel grammatical structure (all verbs OR all noun phrases)
- Lead each item with the differentiating word
- Consistent punctuation (fragments: no period; sentences: period on all)
- Max one level of nesting
- 5-9 items before sub-chunking

**Comparison Tables:**
- Recommended option in first column
- Row headers as user tasks/questions, not feature names
- Consistent cell content (don't mix "Yes," "Included," "check")
- Summary row: "Best for..."

**Step-by-Step Instructions:**
- Numbered lists always (never bullets for sequences)
- Start each step with imperative verb ("Click," "Enter," "Select")
- One action per step
- State the goal before steps
- Include result of each action ("A confirmation appears")
- Max 7-9 steps per procedure; chunk longer ones
- Bold UI element names; use > for menu paths

**Error Messages:**
- Formula: What happened + Why + What to do next
- Plain language, not error codes (codes in parentheses for support)
- Don't over-apologize. Don't blame the user. Be specific about constraints.

**FAQs:**
- Questions in user's voice, first person
- Answer in first sentence directly
- 7-10 questions max (more = primary content has failed)
- Order by frequency, not topic
- FAQs are a symptom — each reveals a content gap to fix

---

## 8. Gap Analysis & Integration Map

*Where this research fills gaps in the current ClarityEngine and Design skills.*

### 8.1 What the Skills Already Cover Well

| Topic | Skill | Coverage |
|-------|-------|----------|
| Inverted pyramid structure | Both | Deep (P1, P2 in ClarityEngine; Principles.md in Design) |
| Scannable architecture (chunking, heading levels) | ClarityEngine | Deep (P4, RC checkpoints) |
| Evidence over assertion | ClarityEngine | Deep (P5) |
| Anti-AI vocabulary | Both | Deep (17 banned terms in Design; anti-AI in ClarityEngine) |
| Format selection (HTML vs PPT) | ClarityEngine | Deep (decision table, adapters) |
| Diagram standards (Mermaid) | ClarityEngine | Deep (max 20 elements, self-contained) |
| Readability gate (Flesch, RC checkpoints) | ClarityEngine | Deep (15-checkpoint contract) |
| Problem framing and trade-offs | Design | Deep (4 pillars, POV statement) |
| Document structure (reader-first) | Design | Deep (OutputQuality.md) |
| Writing density (50% Rule) | Design | Deep (compression, non-data-ink) |
| Scale calibration (Quick/Standard/Full) | Design | Deep |
| Review process | Both | Deep |

### 8.2 Gaps This Research Fills

#### GAP 1: Narrative and Storytelling Structure
**Current state:** Only the inverted pyramid. No narrative arcs, hook techniques, or emotional engagement.
**Research that fills it:** Sections 2.2 (macro structure selection), 3.1-3.2 (hooks and openings), 5.1 (sparkline, SCR, throughline), 1.7 (emotional engagement).
**Integration target:** ClarityEngine Philosophy.md (new principle or addendum) + Design Principles.md

#### GAP 2: Voice, Tone, and Style Calibration
**Current state:** Anti-AI vocabulary (what NOT to sound like), but no guidance on what TO sound like.
**Research that fills it:** Sections 3.5 (voice and tone), 7.3 (voice chart system), W28-W33.
**Integration target:** New addendum in ClarityEngine or cross-cutting guidance

#### GAP 3: Visual Design Beyond Diagrams
**Current state:** ClarityEngine explicitly excludes "full graphic design." No visual hierarchy, typography, color, or layout rules.
**Research that fills it:** Entire Section 4 (visual design), particularly V1-V44 and the quick reference values.
**Integration target:** ClarityEngine FormatAdapters.md (HTML/PPT rendering) or new visual design addendum

#### GAP 4: Presentation-Specific Playbook
**Current state:** ClarityEngine generates presentations but has no presentation-specific narrative or structural guidance.
**Research that fills it:** Entire Section 5, particularly deck archetypes (5.5), opening/closing sequences (5.4), density budgeting (5.6).
**Integration target:** ClarityEngine Workflows/CreateDocument.md (presentation branch) or new presentation addendum

#### GAP 5: Data Visualization Rules
**Current state:** Chart/table formatting not systematically covered beyond Mermaid diagrams.
**Research that fills it:** Entire Section 6, particularly chart type selection (6.3), annotation (6.4), the chart checklist (6.9).
**Integration target:** ClarityEngine (new data viz addendum) or Design OutputQuality.md

#### GAP 6: Copywriting and Engagement Techniques
**Current state:** No guidance on headlines, hooks, curiosity gaps, or persuasion patterns.
**Research that fills it:** Sections 3.1-3.2 (headlines and hooks), 3.6 (persuasion), W1-W12.
**Integration target:** ClarityEngine Philosophy.md (engagement layer) or new writing craft addendum

#### GAP 7: Cognitive Science Foundation
**Current state:** Rules exist but without explicit cognitive science grounding. "Why" is implicit.
**Research that fills it:** Entire Section 1 (cognitive foundations). Provides the research basis for existing rules AND new rules.
**Integration target:** ClarityEngine Philosophy.md (strengthen rationale) or standalone reference

#### GAP 8: Content Patterns by Format
**Current state:** No format-specific content patterns (exec summaries, error messages, FAQs, step-by-step instructions).
**Research that fills it:** Section 7.7 (format-specific patterns).
**Integration target:** ClarityEngine FormatAdapters.md or new content patterns addendum

#### GAP 9: Inclusive Language
**Current state:** Not addressed in either skill.
**Research that fills it:** Section 7.6 (inclusive language rules U24-U29).
**Integration target:** ClarityEngine readability contract or Design vocabulary rules

#### GAP 10: The "So What?" Test / Governing Thought Discipline
**Current state:** Design has it implicitly. ClarityEngine does not enforce it systematically.
**Research that fills it:** IA9 (chunk labels state conclusions), W44 (recursive "So What?"), P11-P12 (action titles).
**Integration target:** Both skills — could be a shared principle

### 8.3 Overlap to Resolve

Both skills independently encode:
- Inverted pyramid / front-load conclusions
- Anti-AI vocabulary
- Reader-first structure
- Format selection logic

The Design skill's SkillIntent explicitly says "No coupling to ClarityEngine." If that boundary is maintained, duplicated rules should be consistent but not cross-referenced. If coupling is permitted, shared principles could be factored into a common reference.

---

## Sources Bibliography

### Books and Seminal Works
| Source | Author(s) | Year |
|--------|-----------|------|
| *Breakthrough Advertising* | Eugene Schwartz | 1966 |
| *Ogilvy on Advertising* | David Ogilvy | 1983 |
| *The Visual Display of Quantitative Information* | Edward Tufte | 1983/2001 |
| *The Elements of Typographic Style* | Robert Bringhurst | 1992 |
| *The Pyramid Principle* | Barbara Minto | 1987 |
| *Don't Make Me Think* | Steve Krug | 2000/2014 |
| *Information Architecture* | Rosenfeld & Morville | 1998/2015 |
| *Show Me the Numbers* | Stephen Few | 2004/2012 |
| *Made to Stick* | Chip & Dan Heath | 2007 |
| *Presentation Zen* | Garr Reynolds | 2008/2012 |
| *Slide:ology* | Nancy Duarte | 2008 |
| *Resonate* | Nancy Duarte | 2010 |
| *Everybody Writes* | Ann Handley | 2014 |
| *Storytelling with Data* | Cole Nussbaumer Knaflic | 2015 |
| *Refactoring UI* | Adam Wathan & Steve Schoger | 2018 |
| *Strategic Writing for UX* | Torrey Podmajersky | 2019 |
| *Content Design* | Sarah Richards | 2017 |
| *Microcopy: The Complete Guide* | Kinneret Yifrah | 2017/2019 |
| *Working Backwards* | Bryar & Carr | 2021 |
| *Influence* / *Pre-Suasion* | Robert Cialdini | 2006/2016 |
| *Thinking, Fast and Slow* | Daniel Kahneman | 2011 |
| *Writing Tools* | Roy Peter Clark | 2006 |
| *TED Talks* | Chris Anderson | 2016 |
| *Practical Typography* | Matthew Butterick | 2010 |
| *The Truthful Art* | Alberto Cairo | 2016 |

### Research and Standards
| Source | Type |
|--------|------|
| Nielsen Norman Group | UX research articles |
| GOV.UK Content Design Guide | Government standard |
| Federal Plain Language Guidelines | Government standard |
| Microsoft Writing Style Guide | Corporate standard |
| Google Developer Docs Style Guide | Technical writing guide |
| Mailchimp Content Style Guide | Corporate standard |
| WCAG 2.1 | Accessibility standard |
| Material Design | Design system |
| ColorBrewer (Cynthia Brewer) | Color palette tool |
| FT Visual Vocabulary | Chart type reference |

### Practitioners and Blogs
| Source | Focus |
|--------|-------|
| Copyhackers (Joanna Wiebe) | Conversion copywriting |
| Copyblogger | Content marketing |
| Henneke Duistermaat (Enchanting Marketing) | Writing craft |
| Julian Shapiro | Writing methodology |
| Brian Dean / Backlinko | SEO copywriting |
| Datawrapper Blog (Lisa Charlotte Muth) | Data visualization |
| The Futur (Chris Do) | Design strategy |
| Andy Raskin | Sales narrative |

### Cognitive Science Papers
| Source | Key Finding |
|--------|-------------|
| Miller (1956) | Working memory 7+/-2 |
| Cowan (2001) | Working memory revised to 4+/-1 |
| Sweller (1988, 1994) | Cognitive Load Theory |
| Mayer (2009) | Multimedia Learning Principles |
| Paivio (1971, 1986) | Dual Coding Theory |
| Von Restorff (1933) | Isolation/distinctiveness effect |
| Ebbinghaus (1885) | Spacing effect, serial position |
| Loewenstein (1994) | Information gap / curiosity |
| Kahneman & Tversky (1979) | Prospect Theory / loss aversion |
| Kahneman et al. (1993) | Peak-end rule |
| Nelson, Reed & Walling (1976) | Picture superiority (6x) |
| Oppenheimer (2008) | Processing fluency |

---

*Generated 2025-03-10 from 7 parallel research tracks. Total rules catalogued: ~650 across all tracks, distilled to ~300 unique, non-overlapping rules in this synthesis.*
