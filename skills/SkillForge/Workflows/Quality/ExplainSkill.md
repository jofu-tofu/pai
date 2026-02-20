# ExplainSkill Workflow

> **Trigger:** "explain skill", "analyze skill structure", "skill usage analysis", "how does this skill work", "decompose skill"

## Reference Material

- `WorkflowDecompose.md` — Internal analysis engine (Phases A-D). Read and execute its phases.
- **Workflow Chains:** `../WorkflowChains.md` — Check Follow-Up section after completing this workflow

## Purpose

Help users understand a skill's structure, file organization, workflow coverage, and content placement. This is the user-facing entry point for structural analysis — it delegates to WorkflowDecompose (an internal workflow) for the actual analysis, then presents results in an accessible format.

## Context & Motivation

Users often want to understand how a skill is organized before making changes. This workflow provides that understanding without requiring knowledge of internal analysis tools. It wraps WorkflowDecompose's detailed analysis in a user-friendly explanation layer.

---

## Workflow Steps

### Step 1: Identify Target Skill

If the user specifies a skill name, use it. Otherwise, ask which skill to explain.

Verify the skill exists:
```
$PAI_DIR/skills/[SkillName]/SKILL.md
```

### Step 2: Run Structural Analysis

Execute WorkflowDecompose's analysis phases (read `WorkflowDecompose.md` and follow Phases A through C):

- **Phase A — File Inventory & Load Map:** Catalog all files, their types, and load conditions
- **Phase B — User Workflow Matrix:** Map triggers to workflows to user outcomes
- **Phase C — Organization Signals:** Check for structural issues

Collect all outputs from these phases.

### Step 3: Present Explanation

Present the analysis in an accessible format:

```markdown
## How [SkillName] Works

### Overview
[1-2 sentence summary of what the skill does and how it's organized]

### File Structure
[Load Map from Phase A, presented as a clean tree]

### What Users Can Do
[User Workflow Matrix from Phase B, focused on trigger → outcome]

### Health Check
[Organization Signals from Phase C]
- Issues found: [count]
- Recommendations: [brief list or "None — structure is clean"]

### Summary
[Quick stats: N files, N workflows, N issues]
```

### Step 4: Offer Next Steps

Based on findings, suggest appropriate next steps:

```
What would you like to do next?
  [I] Improve — Address issues found (chains to ImproveSkill)
  [R] Refactor — Restructure the skill (chains to RefactorSkill)
  [N] Nothing — Just wanted to understand the structure
```

---

## Constraints

- **Read-only by default** — This workflow only analyzes and explains; it does not modify files
- **WorkflowDecompose is internal** — Users interact with ExplainSkill; WorkflowDecompose is the engine
- **Accessible language** — Present technical analysis in user-friendly terms

## Follow-Up

After completing this workflow, evaluate these chain conditions:

| Condition | Chain To | Action |
|---|---|---|
| User chose [I] to address issues | ImproveSkill | Announce: "Running ImproveSkill to address identified issues..." then execute `Workflows/Quality/ImproveSkill.md` |
| User chose [R] to restructure | RefactorSkill | Announce: "Running RefactorSkill to restructure..." then execute `Workflows/Author/RefactorSkill.md` |

**Chain Decision Log (MANDATORY — SC7):**
Log one line per chain in the table above, regardless of outcome:
  `Chain [WorkflowName]: condition [true/false] — [fired/skipped]`
Skipped chains MUST be logged — silence on a skipped chain violates SC7.

If no conditions match, skip follow-ups.
