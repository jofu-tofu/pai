# CreatePptPresentation Workflow

> **Trigger:** "create ppt deck", "create powerpoint deck", "professional presentation"

## Reference Material

- `../FirstPrinciples.md`
- `../ToolingLandscape.md`
- `../QualityChecklist.md`

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

### Step 1: Select Build Path

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

Apply PPT section of `../QualityChecklist.md`:
- Open in target PowerPoint environment
- Verify templates, fonts, and notes
- Check file weight and distribution constraints

### Step 5: Return Artifacts

Return:
- PPTX deck
- Build method and dependencies used
- Outstanding manual polish tasks (if any)
