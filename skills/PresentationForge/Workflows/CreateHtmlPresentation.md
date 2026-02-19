# CreateHtmlPresentation Workflow

> **Trigger:** "create html slides", "build web slides", "lightweight presentation"

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

### Step 1: Choose Engine

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

### Step 5: Return Artifacts

Return:
- HTML deck files
- Run instructions
- Optional export recommendations (PDF or PPT handoff path)
