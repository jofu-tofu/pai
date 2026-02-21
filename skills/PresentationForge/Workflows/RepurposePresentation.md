# RepurposePresentation Workflow

> **Trigger:** "convert presentation", "html to ppt", "ppt to html", "html to powerpoint", "powerpoint to html", "turn into powerpoint"

## Scope

**Best fit for:** Converting an existing presentation or document between HTML and PPT formats while preserving message hierarchy.
**Route to:** `CreatePresentation` for building a new deck from scratch. `ReviewPresentation` for quality-checking an existing deck without format conversion. Conversion produces a fidelity risk log — for pixel-identical reproduction, inform the user that lossless round-trip conversion is outside scope.

## Reference Material

- `../ToolingLandscape.md`
- `../FormatSelection.md`
- `../Standards/ReadabilityStandards.md`

## Purpose

Convert a presentation or document between HTML and PPT while preserving message hierarchy and explicitly reporting fidelity trade-offs.

## Conversion Routing

| Source | Target | Primary Path | Notes |
|---|---|---|---|
| Markdown/HTML | PPT | Marp `--pptx` or PptxGenJS regeneration | Marp is fastest for markdown sources |
| PPT | HTML | Extract structure (python-pptx) then rebuild as scrollable HTML document | Direct HTML generation — no slide engines |

## Workflow Steps

### Step 1: Extract Canonical Content Model

Normalize source into:
- Content sequence (sections for HTML, slides for PPT)
- Per-section/slide intent
- Core text and data points
- Visual requirements

### Step 2: Choose Conversion Path

If source is markdown-friendly, use Marp CLI for PPT target:

```bash
npx @marp-team/marp-cli@latest source.md --pptx -o converted.pptx
```

If source is PPT and target is HTML:
- Extract content with python-pptx automation.
- Rebuild as a scrollable HTML document using semantic HTML with CDN tooling (Tailwind, Mermaid, Prism).

### Step 3: Rebuild Visuals, Do Not Blindly Copy

Preserve meaning first:
- Keep argument order and section purpose.
- Recreate visuals when direct transfer harms readability.
- Refit pacing to target format (scrollable document sections vs. slides).

### Step 4: Run Target-Format Checks

Apply `../Standards/ReadabilityStandards.md` for target format and record any losses:
- Layout drift
- Font substitution
- Content hierarchy gaps
- Notes transfer gaps

### Step 5: Return Conversion Report and Auto-Chain ReadabilityGate

Deliver:
- Converted artifact
- Conversion method used
- `Fidelity Risk Log` with concrete follow-up fixes

**Auto-chain ReadabilityGate** with:
- `artifact`: path to the converted file
- `content_type`: inherited from source or `general`
- `format`: `html` or `ppt` based on target
