# Structural Integrity — Evaluation Rubric

> Agent-ingestible rubric for the structural integrity quality dimension.
> NOT an executable workflow — consumed by AgentEvalOrchestrator agents.

## Focus

Evaluate whether a skill's file structure, naming conventions, frontmatter, and required sections comply with SkillSystem.md and are internally consistent.

## Reference Material

From the **target skill**, read:
- `SKILL.md` — frontmatter, routing table, examples, all sections
- All files in skill directory — verify existence, naming, structure

From **SkillForge**, read:
- `Standards/SkillSystem.md` — canonical structure spec, TitleCase rules, required sections
- `Tools/ValidateSkill.ts` — run `bun run Tools/ValidateSkill.ts [SkillName]` for automated checks

## Rubric

| # | Criterion | PASS | WARN | FAIL |
|---|-----------|------|------|------|
| SI-1 | SKILL.md exists and is readable | File exists at skill root | — | SKILL.md missing or unreadable |
| SI-2 | Valid YAML frontmatter | `name` is TitleCase, `description` is single-line with `USE WHEN` clause, under 1024 chars | Description exists but missing `USE WHEN`, or name has minor casing issue | Frontmatter missing, unparseable, or missing required fields |
| SI-3 | TitleCase naming throughout | Skill directory, all workflow files, all tool files, all context files use TitleCase | 1-2 files have minor naming violations | Systematic naming violations across multiple files |
| SI-4 | Required sections present | `## Workflow Routing` table and `## Examples` section both exist in SKILL.md | One section exists but is minimal or poorly formatted | Either section is missing entirely |
| SI-5 | Workflow references resolve | Every file path in the routing table exists on disk | — | Any routing table entry points to a missing file |
| SI-6 | No ghost files | Every `Workflows/*.md` on disk has a corresponding routing table entry (unless marked as internal) | 1 unrouted workflow file that appears intentionally internal | Multiple workflow files with no routing table entry and no internal marker |
| SI-7 | Directory structure correct | `Tools/` directory exists; `Workflows/` exists if workflows are referenced; no nested subdirectories beyond 2 levels | Minor structural deviation (e.g., empty Tools/) | Required directories missing or forbidden nesting (3+ levels deep) |
| SI-8 | SkillIntent completeness | `SkillIntent.md` exists with `## Problem This Skill Solves`, `## Constraints`, and `## Success Criteria` sections, each with substantive content | SkillIntent.md exists but 1 required section is missing or empty | SkillIntent.md missing entirely, or 2+ required sections absent |
| SI-9 | Automated validator passes | `bun run ValidateSkill.ts [SkillName]` reports all checks passed | Validator reports warnings but no failures | Validator reports 1+ failures |
| SI-10 | File organization clarity | Files are in correct directories; no content misplacement; no orphaned context files | 1 orphaned or misplaced file | Multiple files in wrong locations or orphaned with no references |
| SI-11 | Simplification opportunities | No workflows that could be merged without losing clarity; no redundant routing paths; no unnecessary public surface area | 1-2 workflows with overlapping concerns that could potentially be combined | Multiple workflows with significant overlap, redundant trigger paths, or clearly mergeable functionality |
| SI-12 | No over-exposed intermediary workflows | All workflows in the routing table serve a direct user need; internal/intermediary workflows (called only by other workflows) are marked internal and not in the routing table | 1 workflow in routing table that is borderline intermediary (serves both direct and internal use) | Multiple purely intermediary workflows exposed in the routing table that users would never directly invoke |
