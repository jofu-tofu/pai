# Readability Standards

> Used by: ReadabilityGate.md, CreateHtmlDocument.md, ReviewPresentation.md
>
> General readability rules that apply to ALL content types and output formats.
> Content-specific rules belong in dedicated standards files (e.g., CodebaseAnalysisStandards.md).
>
> **Adding rules:** General rules that apply to ALL content types go here. Content-specific rules go in dedicated standards files. Rule IDs are stable — never renumbered, only deprecated or appended.
>
> Sources: WCAG 2.2, Nielsen Norman Group, Edward Tufte, Richard Mayer, C4 Model, Baymard Institute

---

## Category 1: Typography and Text Readability

### T1: Minimum Body Text Size
Body text must be at least 16px (1rem).
- **Test:** Inspect computed `font-size` of `<p>` and body text elements; must be >= 16px.
- **Sources:** [A11Y Collective](https://www.a11y-collective.com/blog/wcag-minimum-font-size/), [Section508.gov](https://www.section508.gov/develop/fonts-typography/)

### T2: Line Length (Characters Per Line)
Body text containers must constrain line length to 45–80 characters, target 60–70.
- **Test:** Measure rendered character count per line. `max-width` on text containers should produce 45–80 characters at the set font size.
- **Sources:** [Baymard Institute](https://baymard.com/blog/line-length-readability), [UXPin](https://www.uxpin.com/studio/blog/optimal-line-length-for-readability/)

### T3: Line Height (Line Spacing)
Line height for body text must be at least 1.5x the font size.
- **Test:** Inspect computed `line-height`; must be >= 1.5 for body text.
- **Sources:** [W3C — Text Spacing (WCAG 2.2)](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)

### T4: Paragraph Spacing
Spacing between paragraphs must be at least 2x the font size (e.g., 32px for 16px body text).
- **Test:** Inspect `margin-bottom` or `margin-top` on `<p>` elements; must be >= 2em.
- **Sources:** [W3C — Text Spacing (WCAG 2.2)](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)

### T5: Letter and Word Spacing
Letter spacing must be at least 0.12x the font size. Word spacing must be at least 0.16x the font size.
- **Test:** Inspect `letter-spacing` and `word-spacing` CSS values.
- **Sources:** [W3C — Text Spacing (WCAG 2.2)](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)

### T6: Text Resizability
All text must be resizable to 200% without loss of content or functionality. Use relative units (`rem`, `em`, `%`).
- **Test:** Zoom browser to 200%; verify no text is clipped, overlapped, or hidden.
- **Sources:** [WCAG 2.2 Success Criterion 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)

---

## Category 2: Contrast and Color

### C1: Text Contrast Ratio (AA)
Normal text (< 24px) must have a contrast ratio of at least 4.5:1. Large text (>= 24px or >= 18.5px bold) must have at least 3:1.
- **Test:** Use a contrast checker on all text/background combinations.
- **Sources:** [W3C — WCAG 2.2 Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

### C2: Enhanced Contrast (AAA Target)
Target 7:1 contrast for normal text and 4.5:1 for large text (WCAG AAA).
- **Test:** Same as C1 but with AAA thresholds.
- **Sources:** [W3C — WCAG 2.2 Contrast Enhanced](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

### C3: Maximum Distinct Colors
Use no more than 7–8 distinct color hues in diagrams and visualizations. Use a colorblind-safe palette.
- **Test:** Count distinct hues in each diagram; must be <= 8. Verify against a colorblind simulator.
- **Sources:** [European Data Portal](https://data.europa.eu/apps/data-visualisation-guide/accessible-colour-palettes)

### C4: No Red-Green Only Encoding
Never use red and green as the sole distinguishing colors. Always pair color with a second visual channel.
- **Test:** Remove color (convert to grayscale); verify all distinctions remain visible.
- **Sources:** [Tableau](https://www.tableau.com/blog/examining-data-viz-rules-dont-use-red-green-together)

### C5: Consistent Color Coding
Colors must be used consistently across all diagrams within a document. Same color = same semantic meaning.
- **Test:** Audit all diagrams; verify no color is reused with conflicting meaning.
- **Sources:** [C4 Model — Notation](https://c4model.com/diagrams/notation)

---

## Category 3: Heading Hierarchy and Document Structure

### H1: Single H1 Per Document
Each document must have exactly one `<h1>` element, representing the document title.
- **Test:** Count `<h1>` elements; must equal 1.
- **Sources:** [W3C WAI — Headings](https://www.w3.org/WAI/tutorials/page-structure/headings/)

### H2: No Skipped Heading Levels
Headings must not skip levels. An `<h2>` must not be followed directly by an `<h4>` without an intervening `<h3>`.
- **Test:** Parse the heading tree; verify no level gaps.
- **Sources:** [W3C WAI — Headings](https://www.w3.org/WAI/tutorials/page-structure/headings/)

### H3: Maximum Nesting Depth
Heading depth should not exceed 4 levels (H1 through H4). Deeper nesting indicates restructuring is needed.
- **Test:** Check for `<h5>` or `<h6>` elements; flag as warning if present.
- **Sources:** [Smashing Magazine](https://www.smashingmagazine.com/2011/08/html5-and-the-document-outlining-algorithm/)

### H4: Descriptive Heading Text
Every heading must contain descriptive text that summarizes the content below it. No empty or generic headings.
- **Test:** Check that all heading elements have non-empty, non-generic text content.
- **Sources:** [W3C WAI — Headings](https://www.w3.org/WAI/tutorials/page-structure/headings/)

---

## Category 4: Information Architecture and Scanability

### IA1: Chunking (Miller's Law)
No single section should present more than 7 +/- 2 distinct concepts or blocks of information.
- **Test:** Count distinct informational units between same-level headings; flag sections exceeding 9.
- **Sources:** [Laws of UX — Miller's Law](https://lawsofux.com/millers-law/)

### IA2: Progressive Disclosure
Complex or supplementary information must be hidden behind expandable/collapsible elements. Initial view shows the summary.
- **Test:** Check for disclosure widgets for secondary content. Verify initial visible content is the summary layer.
- **Sources:** [NN/G — Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)

### IA3: F-Pattern Compatibility
Critical information must be positioned at the top and left of content areas, consistent with F-pattern reading behavior.
- **Test:** Verify section summaries or key takeaways appear at the beginning of each major section.
- **Sources:** [NN/G — F-Shaped Pattern](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/)

### IA4: Visual Hierarchy through Proximity (Gestalt)
Related elements must be grouped by proximity. Unrelated elements must be separated by whitespace.
- **Test:** Verify spacing between related elements is visibly less than spacing between unrelated elements.
- **Sources:** [NN/G — Gestalt Proximity](https://www.nngroup.com/articles/gestalt-proximity/)

---

## Category 5: White Space and Layout

### WS1: Macro White Space
Content areas should not exceed approximately 800px width for text-dominant sections.
- **Test:** Check `max-width` on text containers; must be <= 800px or equivalent `ch` unit.
- **Sources:** [W3C — White Space for Cognitive Accessibility](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o3p10-whitespace/)

### WS2: Breathing Room Between Sections
Major sections must have vertical spacing of at least 2x the body line-height between them.
- **Test:** Measure vertical spacing between major sections.
- **Sources:** [IxDF — Power of White Space](https://www.interaction-design.org/literature/article/the-power-of-white-space)

---

## Category 6: Navigation (Scrollable Documents)

### N1: Sticky Table of Contents
Documents exceeding 3 screen-heights of content must include a sticky/fixed table of contents.
- **Test:** Verify presence of a `position: sticky` or `position: fixed` ToC element that remains visible during scrolling.
- **Sources:** [NN/G — Table of Contents Design Guide](https://www.nngroup.com/articles/table-of-contents/)

### N2: Active Section Highlighting
The sticky ToC must highlight the currently visible section as the user scrolls.
- **Test:** Scroll through document; verify ToC active state changes to reflect current section.
- **Sources:** [CSS-Tricks — Sticky ToC with Active States](https://css-tricks.com/sticky-table-of-contents-with-scrolling-active-states/)

### N3: Back-to-Top Affordance
Documents longer than 5 screen-heights must provide a "back to top" mechanism.
- **Test:** Check for a back-to-top element that becomes visible on scroll.
- **Sources:** [Smashing Magazine — Long Scrolling](https://www.smashingmagazine.com/2017/05/long-scrolling/)

### N4: Section Anchors
Every major heading (H2 and H3) must have an `id` attribute enabling direct linking. The ToC must link to these anchors.
- **Test:** Verify all H2 and H3 elements have unique `id` attributes and corresponding ToC links.
- **Sources:** [W3C WAI — Page Structure](https://www.w3.org/WAI/tutorials/page-structure/headings/)

---

## Category 7: Diagrams and Visual Elements

### D1: Element Count per Diagram
No single diagram should contain more than 20 labeled elements. Decompose larger diagrams into sub-diagrams.
- **Test:** Count labeled elements per diagram; flag any exceeding 20.
- **Sources:** [C4 Model](https://c4model.com/)

### D2: Every Diagram Must Have a Title and Legend
Every diagram must include a visible title and a legend explaining colors, shapes, line styles, and acronyms.
- **Test:** Verify each diagram has a visible title and legend element.
- **Sources:** [C4 Model — Notation](https://c4model.com/diagrams/notation)

### D3: Self-Contained Diagrams
Each diagram must be understandable without reading surrounding prose. Every element and relationship must be labeled.
- **Test:** Review each diagram in isolation; all elements and connections must be labeled.
- **Sources:** [C4 Model](https://c4model.com/)

### D4: Layered Abstraction (C4 Zoom Levels)
Architecture must be presented at multiple abstraction levels. Each level is a separate diagram. Never mix levels in one diagram.
- **Test:** Verify architecture diagrams exist at 2+ distinct abstraction levels and no single diagram mixes levels.
- **Sources:** [C4 Model](https://c4model.com/)

### D5: Diagram Text Readability
All text within diagrams must meet contrast requirements (Rule C1). Diagram text must be at least 12px, preferably 14px+.
- **Test:** Inspect text size and contrast within SVG/diagram elements.
- **Sources:** [W3C — SVG Accessibility](https://www.w3.org/TR/2000/NOTE-SVG-access-20000807/)

### D6: Diagram Accessibility
Diagrams must include a text alternative: `<title>` and `<desc>` within SVG, or an adjacent prose summary.
- **Test:** Verify each SVG has `role="img"` plus `<title>` and `<desc>`, or has an adjacent text description.
- **Sources:** [Deque — Creating Accessible SVGs](https://www.deque.com/blog/creating-accessible-svgs/)

---

## Category 8: Cognitive Load and Multimedia Learning

### CL1: Coherence Principle
Exclude extraneous content. Every element must serve the document's informational purpose.
- **Test:** Audit each visual element; verify it contributes to understanding. Flag decorative elements without `aria-hidden="true"`.
- **Sources:** [Mayer's Multimedia Learning Principles](https://www.digitallearninginstitute.com/blog/mayers-principles-multimedia-learning)

### CL2: Spatial Contiguity Principle
Corresponding text and visuals must be placed near each other. Labels must be on or immediately adjacent to the element they describe.
- **Test:** Verify every diagram and its explanatory text are visible together without scrolling.
- **Sources:** [Mayer — Spatial Contiguity](https://www.digitallearninginstitute.com/blog/mayers-principles-multimedia-learning)

### CL3: Signaling Principle
Key information must be signaled through visual cues: bold key terms, heading hierarchy, numbered lists for sequences, callout boxes.
- **Test:** Verify key terms are visually emphasized, lists used instead of run-on sentences, findings have callout treatment.
- **Sources:** [Mayer — Signaling Principle](https://www.digitallearninginstitute.com/blog/mayers-principles-multimedia-learning)

### CL4: Data-Ink Ratio (Tufte)
Diagrams must maximize the data-ink ratio. Remove gridlines, borders, background fills, drop shadows, and decorative elements that do not encode information.
- **Test:** Audit diagram elements; flag any that can be removed without losing information.
- **Sources:** [Tufte's Principles](https://thedoublethink.com/tuftes-principles-for-visualizing-quantitative-information/)

### CL5: Visual-First Communication
For technical content, diagrams and visual structures carry the primary narrative load. Prose serves as annotation and context for visuals — not the other way around. Every major concept must be presented visually first (diagram, table, flow, or comparison grid), then supported with text explanation.
- **Test:** For each major section, verify a visual element exists and conveys the core idea independently of surrounding prose.
- **Sources:** [Mayer — Multimedia Principle](https://www.digitallearninginstitute.com/blog/mayers-principles-multimedia-learning), [Tufte — Visual Display of Quantitative Information](https://thedoublethink.com/tuftes-principles-for-visualizing-quantitative-information/)

### CL6: Escalating Abstraction
Documents presenting complex systems must use escalating detail as a narrative structure: overview first (the whole picture), then focused comparison (the key difference or insight), then detailed reference (tables, type maps, specifications), then implications (testing strategy, decision guidance, "so what"). Readers should be able to stop at any level and have a complete understanding at that depth.
- **Test:** Verify the document has at least 3 distinct depth levels. A reader stopping after section 1 should understand the overall structure. A reader stopping after section 2 should understand the key insight. Later sections add detail without contradicting earlier ones.
- **Sources:** [NN/G — Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/), [C4 Model — Zoom Levels](https://c4model.com/)

---

## Category 9: Code Presentation

### CP1: Syntax Highlighting
All code blocks must use syntax highlighting with language specified. Raw unhighlighted code blocks are not acceptable.
- **Test:** Verify code blocks have a language class (e.g., `class="language-typescript"`) and visible syntax coloring.
- **Sources:** [Docsie](https://www.docsie.io/blog/glossary/code-highlighting/)

### CP2: Monospace Font for Code
Code blocks must use a monospace font. Font size for code should be 14–16px (never below 12px).
- **Test:** Inspect `font-family` on code elements; must be monospace. Font size >= 12px.
- **Sources:** General programming convention, accessibility best practices

### CP3: Code Block Line Length
Code blocks should not require horizontal scrolling at normal zoom. Max ~80 characters. Horizontal scroll must be contained to the code block.
- **Test:** Check code blocks have `overflow-x: auto` and do not cause full-page horizontal scroll.
- **Sources:** General programming convention (80-character line limit)

### CP4: Code Block Contrast
Code blocks must have a distinct background color from body text areas, with text contrast still meeting WCAG AA (Rule C1).
- **Test:** Verify code blocks have visibly distinct background and text meets 4.5:1 contrast.
- **Sources:** [WebAIM — Contrast](https://webaim.org/articles/contrast/)
