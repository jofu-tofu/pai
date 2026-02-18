# WorkflowDecompose Workflow

> **Trigger:** "decompose skill", "token audit", "usage analysis", "optimize skill tokens", "analyze skill structure", "how is this skill structured"

## Reference Material

- **Token Budgets:** `../TokenBudgets.md`
- **Authoritative Spec:** `$PAI_DIR/skills/PAI/SYSTEM/SKILLSYSTEM.md`

## Purpose

Analyze a skill's file structure against real user workflow patterns to identify token waste, missing workflows, and sharding opportunities. Produces a concrete optimization report with line-count estimates and optional automated application.

## Prerequisites

- Target skill exists in `$PAI_DIR/skills/[SkillName]/`
- Read `../TokenBudgets.md` for budget targets before running phases

## Workflow Steps

### Phase A — File Inventory & Token Estimation

**Read all files in the target skill directory:**

1. Always loads: `SKILL.md`
2. Conditional loads: each `Workflows/*.md` (loads when that workflow runs)
3. Context files: each `*.md` in skill root except `SKILL.md`

**For each file, record:**
- File path (relative to skill root)
- Line count (use `wc -l` or count lines when reading)
- File type: `SKILL` | `Workflow` | `Context`

**Output — Token Load Map:**
```
Skill: [SkillName]
Total files: N | Total lines: X

ALWAYS LOADS:
  SKILL.md — Y lines

WORKFLOW FILES (load per invocation):
  Workflows/WorkflowName.md — N lines
    Loads context: [files from ## Reference Material section, or "None"]
  ...

CONTEXT FILES (load via workflow reference only):
  ContextFile.md — N lines | Referenced by: [WorkflowA, WorkflowB] or ORPHANED
  ...
```

**Missing section handling:** If a workflow file has no `## Reference Material` section, flag it: `⚠️ [WorkflowName]: no ## Reference Material section — token cost unknown; add section to fix`. Count context loads as 0 for that workflow's estimate.

**Orphan detection:** A context file is orphaned if it appears in zero `## Reference Material` sections across all workflow files.

### Phase B — User Workflow Matrix

**For each workflow file, infer:**
- Trigger phrase(s) from the `> **Trigger:**` line
- User's job-to-be-done (what they get back)
- Total token cost = SKILL.md lines + workflow file lines + all referenced context file lines
- Irrelevant loads = context files listed in Reference Material but not needed for this workflow's output

**Output — User Workflow Matrix:**

| Workflow | Trigger Phrases | User Gets | Token Cost (lines) | Issues |
|----------|----------------|-----------|-------------------|--------|
| WorkflowName | "trigger phrase" | Description of output | 245 | ContextFile.md loads unnecessarily |
| ... | ... | ... | ... | ... |

**Gap detection:** Based on the skill's description and USE WHEN clause, are there trigger intent patterns that no workflow handles? List as "Missing workflow: [what trigger → what user expects]".

### Phase C — Sharding Recommendations

**Evaluate each finding against token budget targets:**
- `SKILL.md`: ≤ 100 lines
- Workflow files: ≤ 150 lines
- Context files: ≤ 200 lines

**Check these 6 optimization signals:**

1. **SKILL.md bloat** — Content in SKILL.md that should be in a context file (sections > 30 lines that aren't routing or quick reference)
2. **Context file always-loading** — A context file referenced by ALL workflows → should live in SKILL.md instead
3. **Workflow too large** — Any workflow > 150 lines → split or extract reference material
4. **Workflow too small** — Any workflow < 20 lines → merge into SKILL.md Quick Reference
5. **Missing workflow** — Trigger intent patterns found in Phase B gap detection
6. **Budget violation** — Any file exceeding its tier limit (flag with exact line count)

For each signal found, produce a numbered recommendation:
```
REC-N: [Action] — [What changes] → saves ~X lines per invocation
  Files: [affected files]
  Risk: [LOW / MEDIUM / HIGH]
```

### Phase D — Report & Optional Execution

**Output the structured report:**

```markdown
## Token Optimization Report: [SkillName]

### Current State
- Total files: N | Total lines: X
- Always-loaded (SKILL.md): Y lines
- Avg lines per invocation: Z (SKILL.md + typical workflow + typical context)

### User Workflow Matrix
[table from Phase B]

### Gap Analysis
[missing workflows or "None found"]

### Recommendations
[numbered recommendations from Phase C]

### Summary
Budget violations: N files over limit
Orphaned context files: N
Estimated savings: X% reduction in avg per-invocation token cost
```

**Then ask:**
```
Apply these recommendations?
  [A] Apply all (LOW risk only)
  [S] Select which to apply
  [R] Report only — no changes
```

**If applying changes — use the RefactorSkill change documentation template:**

For each change, document:
```
CHANGE #: [Title]
What changes: [Specific files and sections]
Why: [Which recommendation this implements]
Risk: [LOW/MEDIUM/HIGH]
Rollback: [Steps to undo]
```

Apply changes using Read/Edit/Write tools directly. After all changes:

```bash
bun $PAI_DIR/skills/UpdateSkill/Tools/ValidateSkill.ts [SkillName]
```

Report final before/after line counts for each modified file.

## Constraints

- **Read-only by default** — Report mode is the safe default; user must explicitly choose to apply
- **LOW risk only in auto-apply** — MEDIUM/HIGH risk changes always require per-change confirmation
- **Concrete numbers required** — Every recommendation must include actual line counts, not vague descriptions
- **Reference Material is the truth** — Infer load cost from `## Reference Material` sections only; do not guess
- **No subdirectories** — File moves must stay within existing directory structure (max 2 levels deep)

## Example Output

```
## Token Optimization Report: UpdateSkill

### Current State
- Total files: 8 | Total lines: 987
- Always-loaded (SKILL.md): 100 lines
- Avg lines per invocation: ~380 (SKILL.md + workflow + 1 context file)

### User Workflow Matrix
| Workflow | Trigger | User Gets | Token Cost | Issues |
|----------|---------|-----------|------------|--------|
| Retrospective | "retrospective on skill" | Improvement report | 481 lines | ValidationChecklist.md loads (177 lines) but validation is optional |
| RefactorSkill | "refactor skill" | Refactoring plan + execution | 467 lines | None |
| ValidateSkill | "validate skill" | Compliance report | 465 lines | OK |

### Recommendations
REC-1: Move ValidationChecklist.md reference from Retrospective to ValidateSkill only
  Files: Workflows/Retrospective.md (remove from Reference Material)
  Risk: LOW → saves ~177 lines when running retrospective

### Summary
Budget violations: 0 | Orphaned files: 0
Estimated savings: 46% reduction for Retrospective invocations
```
