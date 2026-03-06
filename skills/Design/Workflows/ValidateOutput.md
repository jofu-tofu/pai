# ValidateOutput Workflow

> **Trigger:** "validate design output", "check output quality", "run output validation"

## Reference Material

- **Output Quality:** `../OutputQuality.md` — Format selection, density, anti-AI patterns.

## Purpose

Self-validation mini-workflow for design artifacts. Auto-chained by CreateDesign and RecordDecision. Also user-triggerable directly.

The same agent that generated the document runs this as a self-check. On FAIL, revise the document inline before delivering.

## Input Interface

- `artifact` (string) — The completed design document or ADR to validate
- `scale` (quick | standard | full) — Controls which checks run

---

## Workflow Steps

### Step 1: Load Rules

Read `../OutputQuality.md`. Internalize format selection, density principles, and banned patterns before evaluating.

### Step 2: Run Checks

Four binary checks. Each check produces PASS or FAIL.

| Check | What It Tests | PASS Criteria |
|-------|--------------|---------------|
| **Layer-Cake** | Headers tell a coherent story alone | Headers form a standalone narrative (not generic labels like "Overview" or "Details") |
| **Format-Shape** | Each section uses correct format per OutputQuality.md | Every section matches its data shape per the Section Format Guide |
| **Density** | No paragraph compressible without meaning loss | No hedging, throat-clearing, or compressible paragraphs found |
| **AI-ism** | No banned vocabulary or structural patterns | Zero banned terms or patterns from the Anti-AI Writing Patterns section |

### Step 3: Scale Calibration

| Scale | Checks Applied | Enforcement |
|-------|---------------|-------------|
| **Quick** (ADR) | Format-Shape, Density, AI-ism (3 checks) | Fix before delivery |
| **Standard** | All 4 checks | Fix before delivery |
| **Full** | All 4 checks | Fix before delivery; higher scrutiny |

For Quick scale, skip the Layer-Cake check entirely.

### Step 4: Fix Failures

On any FAIL result:
1. Identify the specific violation (section, paragraph, or term)
2. Revise the artifact inline to fix it
3. Note what was found and what was changed

Do not deliver an artifact with known FAIL results. Fix first, then deliver.

### Step 5: Append Self-Check Summary

After the design artifact, append this summary:

```markdown
### Self-Check Summary
| Check | Result | Notes |
|-------|--------|-------|
| Layer-Cake | PASS/FAIL | [brief finding or "—"] |
| Format-Shape | PASS/FAIL | [section name + issue, or "—"] |
| Density | PASS/FAIL | [paragraph cited + fix applied, or "—"] |
| AI-ism | PASS/FAIL | [term/pattern found + replacement, or "—"] |
```

For Quick scale, omit the Layer-Cake row.

---

## Override Policy

Format and vocabulary rules allow justified exceptions. If an agent intentionally uses prose where the guide says table (e.g., a narrative Approach section that genuinely needs prose flow), it may do so with a brief inline justification. The rule is "match data shape" — when the data shape genuinely IS narrative, prose is correct.
