# SynthesizeFindings Workflow

> Internal workflow — invoked by Review.md, not user-facing.

Aggregate outputs from all parallel agents into a unified, deduplicated, prioritized findings list.

## Purpose

Multiple agents reviewing the same diff will overlap. The TypeScript agent and the General agent may both flag the same null check. This workflow collapses duplicates, resolves conflicts, and produces a single coherent findings list ordered by severity and significance.

## Inputs

- Raw agent outputs from `$REVIEW_DIR/agent-outputs.md`
- Context layer from `$REVIEW_DIR/context.md`

## Step 1: Collect All Findings

Read all agent outputs. For each finding, extract:
- File + line range
- Severity (CRITICAL / HIGH / MEDIUM / LOW / SUGGESTION)
- Domain (which agent found it)
- Issue description
- Recommendation

## Step 2: Deduplicate

Two findings are duplicates when they reference the **same file AND overlapping line ranges** (within 5 lines of each other) AND describe the same category of issue.

**Dedup rules:**
- Same file + same line range + same issue category → merge into one finding
- Same file + overlapping lines + different issue categories → keep both (different concerns)
- Different files + similar issue pattern → keep both but note the pattern

**When merging duplicates:**
- Keep the higher severity rating
- Combine recommendations from both agents
- Note which agents independently flagged it (multi-agent agreement = higher confidence)

## Step 3: Resolve Severity Conflicts

When two agents flag the same issue with different severities:
- If one says CRITICAL and another says LOW → use CRITICAL, but note the disagreement
- General rule: take the higher severity and add a confidence note
- Exception: if the lower-severity agent provides specific reasoning for downgrading, include that reasoning as context

## Step 4: Build Architectural Map

Using the context layer's change fingerprint and the findings:
- Group changed files by module/component
- Identify which modules have findings and which are clean
- Produce a 3-5 sentence structural summary: "This change touches [modules]. The [X] module has the most findings ([N]). The [Y] module passed clean across all agents."

## Step 5: Identify Clean Domains

For each agent domain that found NO issues, record it:
- "TypeScript types: No issues found (TypeScript agent reviewed 8 files)"
- "Security: No vulnerabilities detected (Security agent reviewed auth-related changes)"

This is the "What Looks Good" section — it builds credibility by proving agents actually reviewed, not just that they didn't flag.

## Step 6: Produce Unified Findings

Write to `$REVIEW_DIR/findings.md`:

```markdown
## Synthesized Findings

**Total issues:** N (after dedup: M unique)
**By severity:** CRITICAL: X | HIGH: Y | MEDIUM: Z | LOW: W | SUGGESTIONS: V
**Agent agreement:** N findings flagged by 2+ agents

### CRITICAL
[Finding card format — see below]

### HIGH
[...]

### MEDIUM
[...]

### LOW
[...]

### SUGGESTIONS
[...]

### Architectural Map
[3-5 sentence structural summary]

### What Agents Found Nothing Wrong With
[Clean domains with evidence of review]
```

**Finding card format:**
```
**[SHORT_TITLE]** — `[filename]:[line]`
Severity: [CRITICAL/HIGH/MEDIUM/LOW/SUGGESTION]
Flagged by: [Agent1, Agent2] (confidence: [single/multi-agent])
Issue: [1-2 sentences]
Recommendation: [What to do]
```

## Follow-Up

Always chains to → **VerifyClaims**
