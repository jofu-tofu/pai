# CreatePresentation Workflow

> **Trigger:** "create presentation", "build slide deck", "make deck", "make a slideshow", "generate slides"

## Scope

**Best fit for:** New presentations or documents where content strategy, format selection, and narrative structure are all needed from scratch.
**Route to:** `CreateHtmlDocument` for scrollable HTML when format is already decided. `CreatePptPresentation` for PowerPoint when format is already decided. `RepurposePresentation` for converting an existing deck between formats. `ReviewPresentation` for quality-checking an existing deck. For graphic design services, proprietary vendor templates, or deep background research, use dedicated skills instead.

## Reference Material

- `../FirstPrinciples.md`
- `../FormatSelection.md`
- `../ToolingLandscape.md`
- `../Standards/ReadabilityStandards.md`
- `../Standards/CodebaseAnalysisStandards.md`

## Purpose

Create a presentation or document from idea to draft by building a format-neutral story backbone first, then routing to HTML document or PPT output.

## Workflow Steps

### Step 1: Capture Brief Inputs

Collect or infer:
- Topic and required outcome
- Audience and decision context
- Duration and slide budget (for PPT) or scope/depth (for HTML documents)
- Preferred output: `html`, `ppt`, or `auto`
- Research depth: `none`, `quick`, `standard`, or `extensive`

If required inputs are missing, ask concise questions before proceeding.

### Step 1.5: Detect Content Type

Determine the content type for downstream standards selection:

| Content Type | Auto-Detection Keywords |
|---|---|
| `codebase-analysis` | "codebase", "architecture", "module", "API", "dependency", "refactor", "code review", "system design" |
| `technical-writeup` | "research", "analysis", "report", "findings", "investigation" |
| `general` | Default fallback when no keywords match |

- **Manual override always wins** — if user sets content type explicitly, skip auto-detection.
- **Confirmation prompt:** When auto-detected (not user-set), state the detected type and ask user to confirm before proceeding.
- Content type determines which Standards files apply downstream and is passed to all subsequent workflows.

### Step 2: Build the Presentation Brief

Create a neutral brief that is independent of output format:
- One-sentence desired takeaway
- Narrative arc (5–7 beats)
- Content map (slide titles for PPT, section headings for HTML)
- Evidence needs (data points, examples, visuals)
- Content type: `general`, `codebase-analysis`, or `technical-writeup`

### Step 3: Run Research When Needed

If user asks for research, or evidence is missing:
- Invoke `Research` skill.
- Route depth:
  - `quick` -> QuickResearch
  - `standard` -> StandardResearch
  - `extensive` -> ExtensiveResearch
- Use verified sources only.

### Step 4: Select Output Format

Use `../FormatSelection.md`:
- Route to `CreateHtmlDocument` for scrollable documents, analysis, and link-friendly delivery.
- Route to `CreatePptPresentation` for formal and template-constrained delivery.
- If `auto`, decide based on audience and venue.

### Step 5: Return Package

Deliver:
- `Presentation Brief`
- Format selection rationale
- Initial content outline
- Content type
- Next workflow invocation (`CreateHtmlDocument` or `CreatePptPresentation`)

### Step 6: Auto-chain ReadabilityGate

After the format-specific workflow completes, auto-chain `ReadabilityGate` with:
- `artifact`: path to the generated file
- `content_type`: the detected or specified content type
- `format`: `html` or `ppt` based on selected output
