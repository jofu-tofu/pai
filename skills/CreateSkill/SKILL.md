---
name: CreateSkill
description: Create and validate skills. USE WHEN create skill, new skill, skill structure, canonicalize. SkillSearch('createskill') for docs.
---

## Customization

**Before executing, check for user customizations at:**
`$PAI_DIR/skills/CORE/USER/SKILLCUSTOMIZATIONS/CreateSkill/`

If this directory exists, load and apply any PREFERENCES.md, configurations, or resources found there. These override default behavior. If the directory does not exist, proceed with skill defaults.

# CreateSkill

MANDATORY skill creation framework for ALL skill creation requests.

## Authoritative Source

**Before creating ANY skill, READ:** `$PAI_DIR/skills/CORE/SYSTEM/SKILLSYSTEM.md`

**Canonical example to follow:** `$PAI_DIR/skills/_BLOGGING/SKILL.md`

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **CreateSkill** | "create a new skill" | `Workflows/CreateSkill.md` |
| **ValidateSkill** | "validate skill", "check skill" | `Workflows/ValidateSkill.md` |
| **UpdateSkill** | "update skill", "add workflow" | `Workflows/UpdateSkill.md` |
| **CanonicalizeSkill** | "canonicalize", "fix skill structure" | `Workflows/CanonicalizeSkill.md` |

## Quick Reference

- **TitleCase naming required** for all directories, files, and workflows
- **Flat structure only**: maximum 2 levels deep (SkillName/Category/)
- **Context files belong in skill root**, not in subdirectories
- **Dynamic loading** for SKILL.md files exceeding 100 lines
- **Voice notifications** required when executing workflows

## Key Guidelines

**Naming:** TitleCase only (PascalCase) for skills, workflows, and tools
**Structure:** Flat folders with only Workflows/ and Tools/ subdirectories allowed
**Context files:** Documentation lives in skill root, not nested subdirectories
**Dynamic loading:** Use for large skills to reduce context overhead
**Notifications:** Send both voice and text notifications during execution

## Examples

**Example 1: Create a new skill**
```
User: "Create a skill for managing my recipes"
-> Invokes CreateSkill workflow
-> Reads SKILLSYSTEM.md for structure
-> Creates $PAI_DIR/skills/Recipes/SKILL.md
-> Uses TitleCase naming throughout
```

**Example 2: Validate an existing skill**
```
User: "Validate the Daemon skill"
-> Invokes ValidateSkill workflow
-> Checks TitleCase naming
-> Verifies YAML frontmatter format
-> Reports compliance status
```

**Example 3: Fix skill structure**
```
User: "Canonicalize the research skill"
-> Invokes CanonicalizeSkill workflow
-> Renames files to TitleCase
-> Ensures Examples section exists
-> Validates workflow references
```
