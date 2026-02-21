# CreatePptPresentation Workflow

> **Trigger:** "create ppt deck", "create powerpoint deck", "create professional deck"

## Scope

**Best fit for:** Building PowerPoint/PPTX presentations when the output format is already decided as PPT.
**Route to:** `CreatePresentation` when format choice is still open and a full content-strategy pass is needed. `CreateHtmlDocument` when the user needs a scrollable HTML document. `RepurposePresentation` for converting an existing deck. For graphic design services, proprietary vendor templates the user has not provided, or lossless round-trip conversion guarantees, use dedicated tools instead.

## Reference Material

- `../FirstPrinciples.md`
- `../ToolingLandscape.md`
- `../Standards/ReadabilityStandards.md`

## Purpose

Create professional PPT/PPTX presentations with a workflow chosen for speed, template fidelity, or full programmatic control.

## Intent-to-Approach Mapping

| User Intent | Approach | Primary Tooling |
|---|---|---|
| "quick ppt draft from markdown" | Convert markdown to PPTX | Marp CLI |
| "new automated corporate deck" | Programmatic PPT generation | PptxGenJS |
| "edit existing template safely" | Template-preserving PPT editing | python-pptx |

## Marp PPTX Flag Mapping

| User Says | Flag | Effect |
|---|---|---|
| "convert to ppt" | `--pptx` | Standard PPTX export |
| "editable powerpoint" | `--pptx --pptx-editable` | More editable output, lower fidelity risk |
| "set filename" | `-o <file>.pptx` | Explicit output path |

## Workflow Steps

### Step 1: Confirm Presentation Brief

If invoked directly (without coming from CreatePresentation), collect the minimum brief inputs: topic, audience, duration, and desired takeaway. Build a compact Presentation Brief before proceeding. If a brief already exists from CreatePresentation, use it.

### Step 2: Select Build Path

Choose one of:
- Fast conversion path (Marp CLI)
- Programmatic generation path (PptxGenJS)
- Existing-template update path (python-pptx)

### Step 2: Define Slide Contract

Before rendering, define:
- Slide list and narrative intent
- Per-slide content limits
- Visual hierarchy and chart strategy
- Speaker notes requirements

### Step 3: Generate PPT

Marp conversion path:

```bash
npx @marp-team/marp-cli@latest deck.md --pptx -o deck.pptx
```

Programmatic path baseline:

```bash
npm install pptxgenjs
node build-deck.mjs
```

Template-preserving path baseline:

```bash
pip install python-pptx
python build_deck.py
```

### Step 4: Professional Quality Pass

Apply `../Standards/ReadabilityStandards.md` for PPT format:
- Open in target PowerPoint environment
- Verify templates, fonts, and notes
- Check file weight and distribution constraints

### Step 5: Handle Build Issues

If the selected build tool is unavailable or fails, try the next approach in priority order (Marp CLI → PptxGenJS → python-pptx). Report which path was used and why the preferred tool was skipped. If `ReadabilityStandards.md` or `ToolingLandscape.md` are unavailable, apply inline quality checks and note the missing reference in the output.

### Step 6: Return Artifacts

Return:
- PPTX deck
- Build method and dependencies used
- Outstanding manual polish tasks (if any)
