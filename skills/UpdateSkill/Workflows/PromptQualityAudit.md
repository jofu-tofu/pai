# PromptQualityAudit Workflow

> **Trigger:** "prompt quality audit", "audit skill wording", "check skill trigger phrases", "review skill prompts", "wording audit", "audit prompts"

## Purpose

Audit all wording in a target skill — USE WHEN clause, trigger phrases, and workflow step descriptions — against Claude 4.x best practices from `Prompting/Standards.md`. Surfaces low-quality phrases that cause routing failures, over-triggering, or ambiguity.

This is the retrospective counterpart to the Prompt Quality Gates in ModifyContent and ManageWorkflows. Gates prevent bad wording going in; this audit catches bad wording that already exists.

## When to Run

- After importing or migrating a skill from another system
- When users report "skill isn't triggering" or "wrong workflow triggered"
- As part of periodic skill health maintenance
- After a significant revision that touched many trigger phrases

---

## Reference Material

- `PromptingStandards.md` — Wording and trigger phrase quality rules. Read before running audit.

---

## Workflow Steps

### Step 1: Identify Target Skill

```
TARGET: [SkillName]
SKILL_DIR: $PAI_DIR/skills/[SkillName]/
```

Verify `SKILL.md` is readable. If not found, report and stop.

---

### Step 2: Load Reference Standards

Read `PromptingStandards.md` (in this skill's root dir).

Extract and summarize the relevant criteria for this audit:
- Trigger phrase best practices (length, specificity, natural language, verb clarity)
- USE WHEN clause standards (imperative structure, concrete signals, no XML tags)
- Description wording patterns (Claude 4.x recognition patterns)

---

### Step 3: Audit USE WHEN Clause

Read the `description:` frontmatter field from the target skill's SKILL.md.

Evaluate against:
- [ ] **Starts with imperative verb or "USE WHEN"** — e.g., "USE WHEN user says..." not "This skill..."
- [ ] **Concrete signal words** — specific phrases a user would say, not category descriptions
- [ ] **No XML tags** — markdown-first per Claude 4.x patterns
- [ ] **Length appropriate** — comprehensive enough to be recognized, not so long it becomes noise
- [ ] **Unique signals** — distinguishable from other skills' USE WHEN clauses

```
USE WHEN Audit:
  Current: "[current description]"
  Issues found: [list or "none"]
  Suggested revision: "[revised wording if needed]"
```

---

### Step 4: Audit Routing Table Trigger Phrases

For each workflow in the routing table, evaluate ALL trigger phrases:

**Per-phrase checks:**
- [ ] **Length**: 2–6 words
- [ ] **Natural language**: Passes the "say it aloud" test
- [ ] **Specificity**: Unambiguously indicates this workflow
- [ ] **No overlap**: Not semantically equivalent to another workflow's trigger
- [ ] **Verb clarity**: Intended action is obvious from the phrase

```
TRIGGER PHRASE AUDIT:
| Workflow | Phrase | Length | Natural? | Specific? | No overlap? | Verdict |
|----------|--------|--------|----------|-----------|-------------|---------|
| [name]   | "[phrase]" | N | Y/N | Y/N | Y/N | PASS/FAIL |
| ...
```

Flag any phrase that fails 2+ checks as **HIGH RISK**.
Flag any phrase that fails 1 check as **LOW RISK**.

---

### Step 5: Spot-Check Workflow File Descriptions (Optional)

For each workflow file, read the `## Purpose` section. Verify:
- [ ] Clear, action-oriented description
- [ ] Free of jargon that users wouldn't use
- [ ] Consistent with the trigger phrases (purpose matches what triggers imply)

This step is optional — skip if the user requested a quick audit only.

---

### Step 6: Report Findings

```
PROMPT QUALITY AUDIT REPORT — [SkillName]
==========================================
Standards Reference: Prompting/Standards.md (Claude 4.x)

USE WHEN Clause:    [PASS / NEEDS_WORK: N issues]
Trigger Phrases:    [PASS / NEEDS_WORK: N high-risk, M low-risk]
Workflow Purposes:  [PASS / NEEDS_WORK / SKIPPED]

HIGH RISK PHRASES (likely causing routing failures):
  [Workflow]: "[phrase]" — [why it fails]
  → Recommended fix: "[revised phrase]"

LOW RISK PHRASES (may cause ambiguity):
  [Workflow]: "[phrase]" — [why it's borderline]
  → Suggested improvement: "[revised phrase]"

USE WHEN ISSUES:
  Current: "[current text]"
  Issue: [description]
  → Suggested revision: "[revised text]"

OVERALL HEALTH: [CLEAN / NEEDS_WORK / CRITICAL]
```

**This workflow is read-only.** Do not auto-apply fixes. Present findings and ask user which to remediate, then invoke ModifyContent for each fix.

---

## Example Output

```
PROMPT QUALITY AUDIT REPORT — Research
==========================================
Standards Reference: Prompting/Standards.md (Claude 4.x)

USE WHEN Clause:    PASS
Trigger Phrases:    NEEDS_WORK: 1 high-risk, 2 low-risk
Workflow Purposes:  PASS

HIGH RISK PHRASES:
  Summarize: "summarize" (1 word — over-triggers; fires on any content summarization request)
  → Recommended fix: "summarize with research" or "research summary"

LOW RISK PHRASES:
  Analyze: "analyze content" (overlaps with Fabric's "analyze with fabric")
  → Suggested: "research and analyze" to distinguish from Fabric invocation

OVERALL HEALTH: NEEDS_WORK
```
