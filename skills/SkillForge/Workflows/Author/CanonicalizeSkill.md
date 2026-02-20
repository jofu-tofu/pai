# CanonicalizeSkill Workflow

> **Trigger:** "canonicalize skill", "fix skill structure", "convert skill format", "skill naming wrong"

> **Purpose:** Restructure an existing skill to match the canonical format with proper naming conventions.

## Reference Material

- `../../Standards/RiskFramework.md` — Change risk classification guide. Canonicalization involves file renames (Medium risk) and potential structural changes (Medium-High). Read before Step 4 to classify planned changes and confirm user approval level.
- `../../Standards/SkillSystem.md` — Canonical structure spec (also read in Step 1).
- `../../SkillIntent.md` — SkillForge's own design philosophy (First Principles guide how skills should be structured and maintained)

---

## Step 1: Read the Authoritative Source

**REQUIRED FIRST:** Read the canonical structure:

```
$PAI_DIR/skills/SkillForge/Standards/SkillSystem.md
```

This is the authoritative local copy. All SkillForge workflows use this file — no external PAI/SYSTEM dependency.

---

## Step 1.5: SkillIntent Required Sections Check (MANDATORY — cannot skip)

Check if the target skill has a `SkillIntent.md` and whether it contains all three required sections.

```bash
cat $PAI_DIR/skills/[skill-name]/SkillIntent.md
```

**If SkillIntent.md does NOT exist:**
```
⚠️ [skill-name] has no SkillIntent.md.
Options:
  [C] Create SkillIntent now (chains to CreateSkillIntent, then resumes from Step 2)
  [S] Skip this canonicalization and create SkillIntent first
```
Do not proceed to Step 2 until SkillIntent.md exists.

**If SkillIntent.md exists — check for ALL THREE required sections:**

Scan for: `## Problem This Skill Solves`, `## Constraints`, `## Success Criteria`.

**If ANY required section is MISSING:**
```
⚠️ [skill-name]/SkillIntent.md is missing required section(s): [list missing sections].
Options:
  [A] Add missing sections now via CreateSkillIntent, then continue canonicalization
  [S] Skip this canonicalization and complete the SkillIntent first
```
Do not proceed until all three sections are present. There is no defer path.

**If all three sections are PRESENT:** Proceed to Step 2. No action needed.

---

## Step 2: Read the Current Skill

```bash
$PAI_DIR/skills/[skill-name]/SKILL.md
```

Identify what's wrong:
- Multi-line description using `|`?
- Separate `triggers:` array in YAML? (OLD FORMAT)
- Separate `workflows:` array in YAML? (OLD FORMAT)
- Missing `USE WHEN` in description?
- Workflow routing missing from markdown body?
- **Workflow files not using TitleCase?**
- **Skill directory not using TitleCase?**

---

## Step 3: Backup

```bash
cp -r $PAI_DIR/skills/[skill-name]/ $PAI_DIR/history/Backups/[skill-name]-backup-$(date +%Y%m%d)/
```

**Note:** Backups go to `$PAI_DIR/history/Backups/`, NEVER inside skill directories.

---

## Step 4: Enforce TitleCase Naming

**CRITICAL: All naming must use TitleCase (PascalCase).**

### Skill Directory Name
```
WRONG: createskill, create-skill, create_skill, CREATESKILL
CORRECT: Createskill (or CreateSkill for multi-word)
```

### Workflow File Names
```
WRONG: create.md, CREATE.md, create-skill.md, create_skill.md
CORRECT: Create.md, UpdateDaemonInfo.md, SyncRepo.md
```

### Reference Doc Names
```
WRONG: prosody-guide.md, PROSODY_GUIDE.md
CORRECT: ProsodyGuide.md, SchemaSpec.md, ApiReference.md
```

### Tool Names
```
WRONG: manage-server.ts, MANAGE_SERVER.ts
CORRECT: ManageServer.ts (with ManageServer.help.md)
```

**Rename files if needed:**
```bash
# Example: rename workflow files
cd $PAI_DIR/skills/[SkillName]/Workflows/
mv create.md Create.md
mv update-info.md UpdateInfo.md
mv sync_repo.md SyncRepo.md
```

---

## Step 5: Enforce Flat Folder Structure

**CRITICAL: Maximum 2 levels deep - `skills/SkillName/Category/`**

### Check for Nested Folders

Scan for folders deeper than 2 levels:

```bash
# Find any folders 3+ levels deep (FORBIDDEN)
find $PAI_DIR/skills/[SkillName]/ -type d -mindepth 2 -maxdepth 3
```

### Common Violations to Fix

**Nested Workflows:**
```
WRONG: Workflows/Company/DueDiligence.md
FIX: Workflows/CompanyDueDiligence.md
```

**Nested Templates:**
```
WRONG: Templates/Primitives/Extract.md
FIX: Move to skills/Prompting/Extract.md (templates belong in Prompting)
```

**Nested Tools:**
```
WRONG: Tools/Utils/Helper.ts
FIX: Tools/Helper.ts (or delete if not needed)
```

### Flatten Procedure

1. **Identify nested files**: Find any file 3+ levels deep
2. **Rename for clarity**: `Category/File.md` -> `CategoryFile.md`
3. **Move to parent**: Move up one level to proper location
4. **Update references**: Search for old paths and update

**Example:**
```bash
# Before (3 levels - WRONG)
skills/OSINT/Workflows/Company/DueDiligence.md

# After (2 levels - CORRECT)
skills/OSINT/Workflows/CompanyDueDiligence.md
```

**Rule:** If you need to organize many files, use clear filenames NOT subdirectories.

---

## Step 6: Convert YAML Frontmatter

**From old format (WRONG):**
```yaml
---
name: skill-name
description: |
  What the skill does.

triggers:
  - USE WHEN user mentions X
  - USE WHEN user wants to Y

workflows:
  - USE WHEN user wants to A: Workflows/a.md
  - USE WHEN user wants to B: Workflows/b.md
---
```

**To new format (CORRECT):**
```yaml
---
name: SkillName
description: What the skill does. USE WHEN user mentions X OR user wants to Y. Additional capabilities.
---
```

**Key changes:**
- Skill name in TitleCase
- Combine description + triggers into single-line `description` with `USE WHEN`
- Remove `triggers:` array entirely
- Remove `workflows:` array from YAML (moves to body)

---

## Step 7: Add Workflow Routing to Body

Add `## Workflow Routing` section in markdown body:

```markdown
# SkillName

[Description]

## Workflow Routing

**When executing a workflow, output this notification:**

```
Running the **WorkflowName** workflow from the **SkillName** skill...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **WorkflowOne** | "trigger phrase one" | `Workflows/WorkflowOne.md` |
| **WorkflowTwo** | "trigger phrase two" | `Workflows/WorkflowTwo.md` |

## Examples

[Required examples section]

## [Rest of documentation]
```

**Note:** Workflow names in routing table must match file names exactly (TitleCase).

---

## Step 8: Remove Redundant Routing

If the markdown body already had routing information in a different format, consolidate it into the standard `## Workflow Routing` section. Delete any duplicate routing tables or sections.

---

## Step 9: Ensure All Workflows Are Routed

List workflow files:
```bash
ls $PAI_DIR/skills/[SkillName]/Workflows/
```

For EACH file:
1. Verify TitleCase naming (rename if needed)
2. Ensure there's a routing entry in `## Workflow Routing`
3. Verify routing entry matches exact file name

---

## Step 10: Add Examples Section

**REQUIRED:** Every skill needs an `## Examples` section with 2-3 concrete usage patterns.

```markdown
## Examples

**Example 1: [Common use case]**
```
User: "[Typical user request]"
-> Invokes WorkflowName workflow
-> [What skill does]
-> [What user gets back]
```

**Example 2: [Another use case]**
```
User: "[Different request]"
-> [Process]
-> [Output]
```
```

Place the Examples section after Workflow Routing.

---

## Step 11: Verify

Run automated validation on the canonicalized skill:

    bun $PAI_DIR/skills/SkillForge/Tools/ValidateSkill.ts [SkillName]

If any checks fail, fix them before proceeding to Follow-Up.

---

## TitleCase Reference

See SkillSystem.md section "TitleCase Naming Convention" for the complete naming table and rules. This workflow loads SkillSystem.md in its Reference Material.

---

## Follow-Up

After completing this workflow, evaluate these chain conditions:

| Condition | Chain To | Action |
|---|---|---|
| Canonicalization completed | AgentEvalOrchestrator(scoped) | Announce: "Running scoped evaluation after canonicalization..." then invoke `Orchestration/AgentEvalOrchestrator.md` with mode=scoped, changes="file structure reorganized" |

This chain is Always — run it unconditionally after every CanonicalizeSkill execution.

**Chain Decision Log (MANDATORY — SC7):**
Log one line per chain in the table above, regardless of outcome:
  `Chain [WorkflowName]: condition [true/false] — [fired/skipped]`
Always chains: log `condition true — fired`. Silence on any chain entry violates SC7.

## Done

Skill now matches the canonical structure from SkillSystem.md with proper TitleCase naming throughout.
