# SkillIntent -- TestTarget

> **For agents modifying this skill:** Read this before making any changes.

## First Principles
- Simplicity: The skill exists as a minimal, well-structured test fixture. Every element serves the purpose of validating SkillForge workflows.
- Correctness over features: Structure and compliance matter more than capability.

## Problem This Skill Solves
Provides a controlled, minimal skill for testing SkillForge's UpdateSkill, TestSkill, and validation workflows. Without a dedicated test target, SkillForge evaluation would require modifying production skills.

## Design Decisions
| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|
| Single workflow | One DoSomething workflow | Multiple workflows | Keeps the skill minimal so tests focus on SkillForge behavior, not skill complexity |
| Generic naming | TestTarget / DoSomething | Domain-specific names | Avoids confusion with real skills; clearly signals test purpose |
| Empty Tools directory | Present but empty | Omit Tools/ | SkillSystem.md requires Tools/ directory to always be present |

## Explicit Out-of-Scope
- Production use: This skill is not intended for real user tasks.
- Complex workflows: Adding multi-step or branching workflows defeats the minimal test purpose.
- Tool implementations: No CLI tools are needed for a structural test fixture.

## Success Criteria
- SKILL.md passes all SkillForge ValidateSkill.ts checks without errors.
- SkillIntent.md contains all required sections per SkillSystem.md convention.
- The DoSomething workflow file follows the standard workflow structure (Trigger, Reference Material, Purpose, Workflow Steps).

## Constraints
1. Must remain minimal for testing purposes.
2. Must have at least one workflow.
3. Must comply with all SkillSystem.md structural requirements.
