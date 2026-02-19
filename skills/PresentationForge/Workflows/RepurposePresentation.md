# RepurposePresentation Workflow

> **Trigger:** "convert presentation", "html to ppt", "ppt to html"

## Reference Material

- `../ToolingLandscape.md`
- `../FormatSelection.md`
- `../QualityChecklist.md`

## Purpose

Convert a presentation between HTML and PPT while preserving message hierarchy and explicitly reporting fidelity trade-offs.

## Conversion Routing

| Source | Target | Primary Path | Notes |
|---|---|---|---|
| Markdown/HTML | PPT | Marp `--pptx` or PptxGenJS regeneration | Marp is fastest for markdown sources |
| PPT | HTML | Extract structure (python-pptx) then rebuild in HTML engine | Direct one-step conversion is rarely clean |

## Workflow Steps

### Step 1: Extract Canonical Content Model

Normalize source deck into:
- Slide sequence
- Per-slide intent
- Core text and data points
- Visual requirements

### Step 2: Choose Conversion Path

If source is markdown-friendly, use Marp CLI:

```bash
npx @marp-team/marp-cli@latest source.md --pptx -o converted.pptx
```

If source is PPT and target is HTML:
- Extract content with python-pptx automation.
- Rebuild in Slidev/Marp/reveal.js based on interactivity needs.

### Step 3: Rebuild Visuals, Do Not Blindly Copy

Preserve meaning first:
- Keep argument order and slide purpose.
- Recreate visuals when direct transfer harms readability.
- Refit pacing to target format.

### Step 4: Run Target-Format Checks

Use `../QualityChecklist.md` for target format and record any losses:
- Layout drift
- Font substitution
- Animation parity gaps
- Notes transfer gaps

### Step 5: Return Conversion Report

Deliver:
- Converted deck artifact
- Conversion method used
- `Fidelity Risk Log` with concrete follow-up fixes
