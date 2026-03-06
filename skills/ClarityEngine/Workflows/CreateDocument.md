# CreateDocument Workflow

> **Trigger:** "create presentation", "build slide deck", "make deck", "make a slideshow", "generate slides", "create html document", "build web document", "create html report", "create scrollable report", "create ppt deck", "create powerpoint deck", "create professional deck", "analyze codebase", "build deck"

## Scope

**Best fit for:** New documents or presentations where content strategy, format selection, and narrative structure are all needed. Handles all creation paths through a unified pipeline.
**Route to:** `RepurposeDocument` for converting an existing document between formats. `ReviewDocument` for quality-checking an existing document. For graphic design services, proprietary vendor templates, or deep background research, use dedicated skills instead.

## Reference Material

- `../Philosophy.md` — Five comprehension principles and Readability Contract
- `../FormatAdapters.md` — Format-specific rendering instructions
- `../ToolingLandscape.md` — Verified external tooling references

## Purpose

Create a document or presentation from idea to draft by building a philosophy-driven, format-neutral Document Brief first, then rendering through the appropriate format adapter.

## Workflow Steps

### Step 1: Capture Brief Inputs

Collect or infer:
- **Topic**: what is this document about
- **Audience**: who will read it (role, expertise level)
- **Outcome**: what decision or understanding should the reader have after
- **Depth**: `overview`, `standard`, or `deep-dive` (default: `standard`)
- **Format preference**: `html`, `ppt`, or `auto` (default: `auto`)

If required inputs are missing, ask concise questions before proceeding.

### Step 2: Detect Content Type

| Content Type | Auto-Detection Keywords |
|---|---|
| `codebase-analysis` | "codebase", "architecture", "module", "API", "dependency", "refactor", "code review", "system design" |
| `technical-writeup` | "research", "analysis", "report", "findings", "investigation" |
| `general` | Default fallback when no keywords match |

- Manual override always wins.
- When auto-detected, state the detected type and ask user to confirm before proceeding.
- Content type determines which Philosophy.md sections apply downstream.

### Step 3: Load Philosophy

Read `../Philosophy.md`. Apply the five comprehension principles to all subsequent content decisions. If content type is `codebase-analysis`, also load the Codebase Analysis Addendum from Philosophy.md.

### Step 4: Build Document Brief

Create a format-neutral brief:

| Field | Required | Description |
|-------|----------|-------------|
| `topic` | yes | What is this document about |
| `audience` | yes | Who will read it (role, expertise level) |
| `outcome` | yes | What decision or understanding should the reader have after |
| `content_type` | yes | One of: `general`, `codebase-analysis`, `technical-writeup` |
| `key_takeaway` | yes | The single most important thing the reader should remember |
| `narrative_arc` | yes | Ordered list of sections with one-line summaries |
| `evidence_needs` | no | What data, code, or sources need to be gathered |
| `format` | no | If user specified a format, record it here; otherwise blank |
| `depth` | no | `overview`, `standard`, or `deep-dive` (default: `standard`) |

### Step 5: Run Research When Needed

If user asks for research, or evidence is missing:
- Invoke the Research skill
- Use verified sources only

### Step 6: Select Output Format

Read `../FormatAdapters.md` and apply Format Selection Logic:
- If user specified format, honor it
- If `auto`, decide based on audience, venue, and content type
- Document the selection rationale

### Step 7: Render

Follow the appropriate adapter section in `../FormatAdapters.md`:
- **HTML**: Generate semantic HTML with CDN tooling, apply CSS targets, build document structure, open in browser
- **PPT**: Select build path (Marp/PptxGenJS/python-pptx), define slide contract, generate PPTX

### Step 8: Auto-Chain ReadabilityGate

After rendering, auto-chain the `ReadabilityGate` workflow with:
- `artifact`: path to the generated file
- `content_type`: the detected or specified content type
- `format`: `html` or `ppt` based on selected output
