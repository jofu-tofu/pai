# CreatePresentation Workflow

> **Trigger:** "create presentation", "build slide deck", "make deck", "make a slideshow", "generate slides"

## Scope

**Best fit for:** New presentations where content strategy, format selection, and narrative structure are all needed from scratch.
**Route to:** `CreateHtmlPresentation` for browser-ready HTML when format is already decided. `CreatePptPresentation` for PowerPoint when format is already decided. `RepurposePresentation` for converting an existing deck between formats. `ReviewPresentation` for quality-checking an existing deck. For graphic design services, proprietary vendor templates, or deep background research, use dedicated skills instead.

## Reference Material

- `../FirstPrinciples.md`
- `../FormatSelection.md`
- `../ToolingLandscape.md`
- `../QualityChecklist.md`

## Purpose

Create a presentation from idea to draft by building a format-neutral story backbone first, then routing to HTML or PPT output.

## Workflow Steps

### Step 1: Capture Brief Inputs

Collect or infer:
- Topic and required outcome
- Audience and decision context
- Duration and slide budget
- Preferred output: `html`, `ppt`, or `auto`
- Research depth: `none`, `quick`, `standard`, or `extensive`

If required inputs are missing, ask concise questions before proceeding.

### Step 2: Build the Presentation Brief

Create a neutral brief that is independent of output format:
- One-sentence desired takeaway
- Narrative arc (5-7 beats)
- Slide map (title + purpose for each slide)
- Evidence needs (data points, examples, visuals)

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
- Route to `CreateHtmlPresentation` for lightweight or interactive delivery.
- Route to `CreatePptPresentation` for formal and template-constrained delivery.
- If `auto`, decide based on audience and venue.

### Step 5: Return Package

Deliver:
- `Presentation Brief`
- Format selection rationale
- Initial slide outline
- Next workflow invocation (`CreateHtmlPresentation` or `CreatePptPresentation`)

### Step 6: Recommend Quality Pass

Recommend running `ReviewPresentation` before final delivery.
