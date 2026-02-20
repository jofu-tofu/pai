# WorkflowDecompose Workflow

> **Internal workflow** — not directly user-facing. Called by ExplainSkill and other workflows.
> Former triggers ("decompose skill", "skill usage analysis", "analyze skill structure") now route through ExplainSkill.

## Reference Material

- **Workflow Chains:** `../WorkflowChains.md` — Check Follow-Up section after completing this workflow

## Purpose

Analyze a skill's file structure to understand what files exist, which load in which situations, where content is misplaced, and where coverage gaps exist. Produces a concrete structure report with optional remediation.

**Not this workflow if:** User wants to improve skill quality against criteria (→ ImproveSkill), wants a comprehensive multi-dimension audit (→ AuditSkill), or wants to apply specific content changes they already identified (→ ModifyContent).

The goal is **organizational clarity**, not token savings. A skill should be as complete as its content requires. Content should live where it will actually be found and used — that's the standard for placement decisions.

---

## Workflow Steps

### Phase A — File Inventory & Load Map

**Read all files in the target skill directory:**

1. Always loads: `SKILL.md`
2. Conditional loads: each `Workflows/*.md` (loads when that workflow runs)
3. Context files: each `*.md` in skill root except `SKILL.md`

**For each file, record:**
- File path (relative to skill root)
- Line count (informational — not a budget)
- File type: `SKILL` | `Workflow` | `Context`

**Output — Load Map:**
```
Skill: [SkillName]
Total files: N | Total lines: X

ALWAYS LOADS:
  SKILL.md — Y lines

WORKFLOW FILES (load per invocation of that workflow):
  Workflows/WorkflowName.md — N lines
    Loads context: [files from ## Reference Material section, or "None"]
  ...

CONTEXT FILES (load via workflow reference only):
  ContextFile.md — N lines | Referenced by: [WorkflowA, WorkflowB] or ORPHANED
  ...
```

**Missing section handling:** If a workflow file has no `## Reference Material` section, flag it: `⚠️ [WorkflowName]: no ## Reference Material section — add section to clarify what context this workflow needs`.

**Orphan detection:** A context file is orphaned if it appears in zero `## Reference Material` sections across all workflow files.

---

### Phase B — User Workflow Matrix

**For each workflow file, infer:**
- Trigger phrase(s) from the `> **Trigger:**` line
- User's job-to-be-done (what they get back)
- Context files that load alongside it

**Output — User Workflow Matrix:**

| Workflow | Trigger Phrases | User Gets | Context Loaded | Issues |
|----------|----------------|-----------|----------------|--------|
| WorkflowName | "trigger phrase" | Description of output | [files] or None | [any issues] |
| ... | ... | ... | ... | ... |

**Gap detection:** Based on the skill's description and USE WHEN clause, are there trigger intent patterns that no workflow handles? List as "Missing workflow: [what trigger → what user expects]".

---

### Phase C — Organization Signals

Check these 6 signals for organizational problems. Each signal is about **content clarity and correctness of placement** — not line counts.

1. **SKILL.md content that belongs elsewhere** — Sections in SKILL.md that are only relevant to specific workflows (not universal to all invocations) should live in a context file or the workflow itself
2. **Context file used by every workflow** — A context file referenced by ALL workflows is effectively universal; consider whether it belongs in SKILL.md instead
3. **Workflow doing multiple distinct jobs** — A workflow that serves two conceptually separate user needs should be split into two focused workflows
4. **Workflow too thin to justify its own file** — A workflow with fewer than ~20 lines may belong folded into SKILL.md Quick Reference
5. **Missing workflow** — Trigger intent patterns identified in Phase B gap detection
6. **Orphaned context file** — Context file never referenced by any workflow; should be deleted, integrated, or wired in

For each signal found, produce a numbered recommendation:
```
REC-N: [Action] — [What changes and why]
  Files: [affected files]
  Risk: [LOW / MEDIUM / HIGH]
```

---

### Phase D — Report & Optional Execution

**Output the structured report:**

```markdown
## Structure Analysis Report: [SkillName]

### Current State
- Total files: N | Total lines: X
- SKILL.md: Y lines
- Workflows: N files

### Load Map
[from Phase A]

### User Workflow Matrix
[table from Phase B]

### Gap Analysis
[missing workflows or "None found"]

### Recommendations
[numbered recommendations from Phase C]

### Summary
Orphaned context files: N
Coverage gaps: N
Recommendations: N (LOW: X, MEDIUM: Y, HIGH: Z)
```

**Then ask:**
```
Apply these recommendations?
  [A] Apply all (LOW risk only)
  [S] Select which to apply
  [R] Report only — no changes
```

**If applying changes — document each change:**

```
CHANGE #: [Title]
What changes: [Specific files and sections]
Why: [Which recommendation this implements]
Risk: [LOW/MEDIUM/HIGH]
Rollback: [Steps to undo]
```

Apply changes using Read/Edit/Write tools directly. After all changes, run ValidateSkill on the target skill.

---

## Constraints

- **Read-only by default** — Report mode is the safe default; user must explicitly choose to apply
- **LOW risk only in auto-apply** — MEDIUM/HIGH risk changes always require per-change confirmation
- **Concrete reasoning required** — Every recommendation must explain *why* the placement is wrong, not just that it's large
- **Reference Material is the truth** — Infer what loads when from `## Reference Material` sections only; do not guess

## Follow-Up

After completing this workflow, evaluate these chain conditions:

| Condition | Chain To | Action |
|---|---|---|
| Analysis reveals structural issues needing action | RefactorSkill | Announce: "Running RefactorSkill to address structural issues found..." then execute `Workflows/Author/RefactorSkill.md` |

**Chain Decision Log (MANDATORY — SC7):**
Log one line per chain in the table above, regardless of outcome:
  `Chain [WorkflowName]: condition [true/false] — [fired/skipped]`
Skipped chains MUST be logged — silence on a skipped chain violates SC7.

If no conditions match, skip follow-ups.
