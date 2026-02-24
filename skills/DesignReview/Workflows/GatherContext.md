# GatherContext Workflow

> Internal workflow - invoked by `Review.md`, not user-facing.

## Input / Output

**Input:**
- Target skill name/path
- Optional scope hints from user request

**Output:**
- Writes `$REVIEW_DIR/context.md`
- Returns absolute path to `context.md`

## Purpose

Create a context layer that gives downstream agents a complete map of the target design surface and review scope.

## Step 1: Resolve Target

1. Resolve target skill directory (`skills/[TargetSkill]`).
2. If path is invalid, return an explicit error.
3. Define default in-scope artifacts:
   - `SKILL.md`
   - `SkillIntent.md` (if present)
   - `Workflows/**/*.md`
   - `Dimensions/**/*.md` (if present)
   - `Templates/**/*.md` (if present)

## Step 2: Build Structural Inventory

Collect:
1. File map by category (entrypoint, internal stages, dimensions, templates, standards)
2. Workflow map:
   - User-facing workflows from routing table
   - Internal workflow files not in routing
3. Existing diagram coverage (`mermaid` blocks)
4. External metadata links (`https://` or `http://`)

## Step 3: Extract Scope and Intent Signals

Summarize:
1. What this skill is meant to produce
2. What the user asked to prioritize
3. Likely risk areas:
   - Scope ambiguity
   - Missing evidence for claims
   - Metadata boundary issues
   - Missing visuals for structure-heavy sections

## Step 4: Produce Context Layer

Write `context.md` with this structure:

```markdown
## DesignReview Context Layer

### Target
- Skill: [name]
- Root: [path]

### Scope
- Included: [list]
- Excluded: [list]

### Structural Inventory
- Entrypoints: [...]
- Internal stages: [...]
- Dimensions available: [...]
- Templates/standards: [...]

### Metadata Signals
- External links: [count + list]
- Missing in-doc summaries for linked critical items: [yes/no + details]

### Dimension Signals
- D1: [reason]
- ...
- D8: [reason]

### File List
[flat list of files to review]
```

Ensure this file is written to `$REVIEW_DIR/context.md`.
