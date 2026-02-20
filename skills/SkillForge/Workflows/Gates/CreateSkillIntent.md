# CreateSkillIntent Workflow

> **Trigger:** "create skill intent", "add skill intent", "document skill purpose", "write skill intent", "generate skill intent"

## Reference Material

- `../../Standards/SkillSystem.md` — SkillIntent.md standard structure and conventions
- `../../SkillIntent.md` — SkillForge's own SkillIntent as a concrete example

## Purpose

Generate a `SkillIntent.md` for any target skill. This document captures the original design decisions, out-of-scope boundaries, and constraints that all future updates must respect. It is the "why" behind the skill — an anchor that prevents successive updates from drifting the skill off its original mission.

---

## Workflow Steps

### Step 1: Identify Target Skill and Check Existing State

```
TARGET: [SkillName]
SKILL_DIR: [skill root directory]
```

Read the target skill's `SKILL.md`. Extract:
- `description:` field (USE WHEN clause — reveals intended scope)
- `## Workflow Routing` table (reveals what operations the skill supports)
- `## Examples` section (reveals expected usage patterns)

Check if `SkillIntent.md` already exists in the skill root.

**If SkillIntent.md exists:** Show current contents, ask:
```
SkillIntent.md already exists for [SkillName]. What would you like to do?
  [U] Update specific sections
  [O] Overwrite entirely
  [C] Cancel
```

**If not found:** Proceed to Step 2.

---

### Step 2: Infer Context from Existing Files

Before interviewing the user, synthesize what can be inferred from the skill itself:

**From the description:** What problem does the skill solve? Who is the intended user?

**From the routing table:** What are the distinct operations? Are there any workflows that seem narrowly scoped or potentially out of scope?

**From examples:** What are the canonical use cases? What tone/style does the skill use?

**From SkillSystem.md:** What structural decisions were already made (flat structure, TitleCase, etc.) — these are constraints for every skill and don't need to be documented again in SkillIntent.md.

Summarize your inferences:
```
INFERRED:
  Problem: [what this skill solves]
  Core operations: [list from routing table]
  Canonical users: [who would invoke this]
  Obvious out-of-scope: [what clearly doesn't belong]
```

---

### Step 3: Interview for Unknown Design Decisions

Ask the user to confirm, correct, or enrich the inferences. Focus on what CANNOT be inferred from the skill files alone:

**Question set (ask these as a group, not one-by-one):**

1. **First principles:** What enduring truths guide this skill's design? What philosophical anchors should survive any refactor? *(Examples: "signal density over completeness", "user-workflow-first", "the WHY endures, the WHAT changes")*

2. **Problem statement:** Does this capture why the skill was built?
   > "[Inferred problem statement]"

3. **Key design decisions:** Why does the skill work the way it does? What alternatives were considered and rejected? *(Examples: "We chose workflow-per-operation over one big workflow because..." or "We deliberately don't auto-apply because...")*

4. **Explicit out-of-scope:** What should this skill NEVER do, even if users ask? Why is that boundary there?

5. **Non-negotiable constraints:** What rules must survive any future refactoring? *(Examples: "always read-only by default", "never delete without confirmation")*

6. **Success criteria:** How do you know when this skill has successfully done its job? Describe the ideal state — binary YES/NO philosophical conditions, not implementation steps. *(Examples: "every context file reference resolves bidirectionally", "design intent is consulted before any modification begins" — NOT "Step 2.5 runs the SkillIntent check")*

---

### Step 4: Generate SkillIntent.md

Using the inferred context (Step 2) and interview answers (Step 3), write `SkillIntent.md` to the target skill's root directory.

**Required structure** (from `SkillSystem.md`):

```markdown
# SkillIntent — [SkillName]

> **For agents modifying this skill:** Read this before making any changes. It captures
> the original design decisions, explicit out-of-scope boundaries, and constraints that
> all updates must respect.

---

## First Principles

[Core philosophical principles that all decisions derive from. What enduring truths guide this skill's design? Each principle should be a named concept with a brief explanation.]

---

## Problem This Skill Solves

[What gap exists without this skill? What breaks or gets done inconsistently?]

---

## Design Decisions

| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|
| [aspect] | [what was chosen] | [what was rejected] | [reasoning] |

---

## Explicit Out-of-Scope

[Bulleted list of what this skill deliberately does NOT handle, with brief reasoning for each boundary]

---

## Success Criteria

What "this skill successfully executed" looks like. Each criterion must be a binary YES/NO verifiable condition describing a philosophical ideal state — not an implementation step.

- [ ] [Philosophical state — e.g., "Every context file reference resolves bidirectionally"]
- [ ] [Philosophical state — e.g., "Design intent is consulted before any modification begins"]

**Quality gate — reject any criterion that:**
- Uses vague qualifiers: "works well", "is efficient", "looks right", "is complete"
- Requires subjective judgment with no observable artifact
- Is compound (contains "and" — split into two criteria)
- References specific workflow step numbers, log formats, or file paths (describe the ideal state, not how to check it)

---

## Constraints

[Numbered list of non-negotiable rules that must remain true through any update or refactoring]
```

**Quality criteria:**
- Problem statement is specific enough that a new agent could understand the skill's purpose without reading SKILL.md
- Each design decision includes the rejected alternative — "we chose X" is incomplete; "we chose X over Y because Z" is the pattern
- Out-of-scope entries have a reason, not just a statement
- Constraints are verifiable — a future agent should be able to check whether a proposed change violates them

---

### Step 4.5: Testability Gate — Validate Success Criteria

Before confirming with the user, re-read each criterion you wrote in the `## Success Criteria` section and apply the quality gate from the template:

For each criterion, answer:
- [ ] **Is it binary?** Can it be answered YES or NO in under 5 seconds with a concrete check?
- [ ] **Is there an observable artifact?** Does the YES answer point to something you can inspect (a file, a section, a transcript entry, a tool output)?
- [ ] **Is it atomic?** Does it contain "and"? If yes → split into two criteria.
- [ ] **No vague qualifiers?** Reject: "works well", "is complete", "looks right", "is appropriate", "is comprehensive".
- [ ] **Minimum 3 criteria?** SC2 requires at least 3 criteria covering **distinct** aspects of the skill's post-update state. A single criterion or two overlapping criteria fails SC2. If fewer than 3, add criteria now — do not proceed to Step 5.

**If any criterion fails the quality gate:** Rewrite it before proceeding. Do not present untestable or insufficient criteria to the user.

### Step 5: Confirm and Write

Show the generated `SkillIntent.md` to the user for review before writing.

```
Here's the SkillIntent.md for [SkillName]:

[preview content]

Write this to [skill root]/SkillIntent.md?
  [Y] Yes, write it
  [E] Edit first
  [C] Cancel
```

On confirmation, write the file.

---

### Step 6: Output Summary

```
SUMMARY: Created SkillIntent.md for [SkillName]
LOCATION: [path to file]
SECTIONS:
  First principles: [N principles]
  Problem statement: [1-sentence summary]
  Design decisions: [N decisions documented]
  Out-of-scope: [N items]
  Success criteria: [N criteria]
  Constraints: [N constraints]
COMPLETED: SkillIntent.md written. Future SkillForge operations on [SkillName]
           will read this file before making changes.
```
