# SkillIntent — TestTarget

> **For agents modifying this skill:** Read this before making any changes.

## First Principles

1. Simplicity over completeness — this skill exists to test SkillForge, not to do real work
2. Structural correctness matters more than content depth — the skill must pass all validation checks

## Problem This Skill Solves

Provides a minimal, structurally correct skill that SkillForge workflows (UpdateSkill, TestSkill, etc.) can target for testing and evaluation. Without it, SkillForge tests would need to operate on production skills.

## Design Decisions

| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|
| Single workflow | One ProcessInput workflow | Multiple workflows | Minimalism; one workflow is sufficient for testing update/rename operations |
| Generic naming | TestTarget | SkillForgeTestFixture | Shorter, clearer intent |

## Explicit Out-of-Scope

- Real task processing or automation — this skill is a test fixture only
- Multiple workflows — keep it minimal unless testing requires expansion
- Tool implementations — the Tools/ directory stays empty

## Success Criteria

1. The skill passes ValidateSkill.ts with zero errors
2. All routing table entries resolve to existing workflow files
3. The SkillIntent.md contains all required sections per SkillSystem.md

## Constraints

1. Must remain minimal for testing purposes
2. Must have at least one workflow
3. Must follow all SkillSystem.md structural requirements
