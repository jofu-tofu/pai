# CreateHtmlDocument Workflow

> **Trigger:** "create html document", "build web document", "create html report", "create scrollable report"

## Scope

**Best fit for:** Building scrollable, semantic HTML documents optimized for reading, analysis, and sharing by link.
**Route to:** `CreatePresentation` when format choice is still open and a full content-strategy pass is needed. `CreatePptPresentation` when the user needs PowerPoint slide output. `RepurposePresentation` for converting an existing document between formats. For graphic design services or proprietary vendor templates, use dedicated skills instead.

## Reference Material

- `../Standards/ReadabilityStandards.md`
- `../Standards/CodebaseAnalysisStandards.md` (when content type is `codebase-analysis`)
- `../FormatSelection.md`
- `../ToolingLandscape.md`

## Purpose

Build professional, scrollable HTML documents optimized for reading comprehension, easy sharing, and reliable delivery in browser contexts. No slide engines — generates semantic HTML directly.

## CDN Tooling

All tooling loads via CDN for zero build-step workflow:

| Tool | CDN | Purpose |
|------|-----|---------|
| Tailwind CSS | `https://cdn.tailwindcss.com` | Professional styling without build step |
| Mermaid.js | `https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js` | Diagram rendering |
| Prism.js | `https://cdn.jsdelivr.net/npm/prismjs/` | Syntax highlighting for code blocks |

> **Limitation:** CDN dependencies require internet access. Offline or air-gapped environments are not currently supported. Address self-contained fallback if requested.

## Workflow Steps

### Step 1: Confirm Document Brief

If invoked directly (without coming from CreatePresentation), collect the minimum brief inputs:
- Topic and required outcome
- Audience and decision context
- Content type: `general`, `codebase-analysis`, or `technical-writeup`
- Desired depth and scope

If a brief already exists from CreatePresentation, use it (including content type).

### Step 2: Load Applicable Standards

Always load `../Standards/ReadabilityStandards.md` (33 general rules).

If content type is `codebase-analysis`, also load `../Standards/CodebaseAnalysisStandards.md`.

### Step 3: Build Document Structure

Create the document skeleton:
- Single `<h1>` document title
- Sticky table of contents with section anchors (Rule N1, N4)
- Heading hierarchy: H1 → H2 → H3 → H4 maximum (Rule H2, H3)
- Section anchors with `id` attributes on all H2 and H3 elements (Rule N4)
- Back-to-top affordance for long documents (Rule N3)
- Progressive disclosure with `<details>`/`<summary>` for supplementary content (Rule IA2)

### Step 4: Generate Semantic HTML

Build the document with inline/CDN CSS:
- Tailwind CSS via CDN for layout and typography
- `max-width: 75ch` on text containers for optimal line length (Rule T2)
- Body text at 16px minimum with 1.5x line height (Rules T1, T3)
- Responsive layout that works on mobile and desktop
- Mermaid.js for any architectural or flow diagrams
- Prism.js for syntax-highlighted code blocks (Rule CP1)
- Distinct code block styling with contrast (Rule CP4)

### Step 5: Validate Against Standards

Before delivery, check the document against loaded standards:
- Typography rules (T1–T6): font sizes, line length, spacing
- Contrast rules (C1–C5): text contrast, color consistency
- Structure rules (H1–H4): heading hierarchy, descriptive headings
- Navigation rules (N1–N4): sticky ToC, section anchors, back-to-top
- Cognitive load rules (CL1–CL5): coherence, contiguity, signaling

Fix any violations found during validation.

### Step 6: Return Artifacts and Auto-Chain ReadabilityGate

Return:
- HTML document file
- View instructions (open in browser)
- Content type and format metadata

**Auto-chain ReadabilityGate** with:
- `artifact`: path to the generated HTML file
- `content_type`: the detected or specified content type
- `format`: `html`
