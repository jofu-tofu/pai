# CreateHtmlPresentation Workflow

> **Trigger:** "create html slides", "build web slides", "create lightweight slides"

## Scope

**Best fit for:** Building browser-native HTML slide decks when the output format is already decided as HTML.
**Route to:** `CreatePresentation` when format choice is still open and a full content-strategy pass is needed. `CreatePptPresentation` when the user needs PowerPoint output. `RepurposePresentation` for converting an existing deck. For graphic design services or proprietary vendor templates, use dedicated skills instead.

## Reference Material

- `../FormatSelection.md`
- `../ToolingLandscape.md`
- `../QualityChecklist.md`

## Purpose

Build lightweight HTML presentations optimized for fast iteration, easy sharing, and reliable delivery in browser contexts.

## Intent-to-Tool Mapping

### Engine Selection

| User Intent | Tool | Why |
|---|---|---|
| "quick draft", "markdown deck", "fast output" | Marp CLI | Lowest setup and fastest conversion loop |
| "developer talk", "interactive components" | Slidev | Strong component model and technical presentation UX |
| "custom interactions", "web-native control" | reveal.js | Deep HTML presentation API and plugins |

### Marp Flag Selection

| User Says | Flag | Effect |
|---|---|---|
| "watch while editing" | `-w` | Live rebuild during edits |
| "export pdf" | `--pdf` | Produce PDF handout/delivery variant |
| "name output file" | `-o <file>` | Explicit output path |

## Workflow Steps

### Step 1: Confirm Presentation Brief

If invoked directly (without coming from CreatePresentation), collect the minimum brief inputs: topic, audience, duration, and desired takeaway. Build a compact Presentation Brief before proceeding. If a brief already exists from CreatePresentation, use it.

### Step 2: Choose Engine

Default to Marp CLI unless interactivity requirements indicate Slidev or reveal.js.

### Step 2: Build Deck Source

Create markdown-first slide content:
- Title and objective slide
- Core argument slides
- Evidence visuals
- Closing ask and next steps

### Step 3: Execute HTML Build

For Marp default path:

```bash
npx @marp-team/marp-cli@latest deck.md -o deck.html
```

Optional watch mode:

```bash
npx @marp-team/marp-cli@latest -w deck.md
```

### Step 4: Validate Delivery Quality

Apply HTML section of `../QualityChecklist.md`:
- No console/runtime failures
- Readability and contrast checks
- Keyboard navigation checks
- Projector-size layout checks

### Step 5: Handle Build Issues

If the chosen engine is unavailable or the build command fails, try the next engine in priority order (Marp CLI → Slidev → reveal.js). Report which engine was used and why the preferred engine was skipped. If `QualityChecklist.md` or `ToolingLandscape.md` are unavailable, apply inline quality checks and note the missing reference in the output.

### Step 6: Return Artifacts

Return:
- HTML deck files
- Run instructions
- Optional export recommendations (PDF or PPT handoff path)
