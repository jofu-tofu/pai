# ReviewSkill Workflow

> **Trigger:** "review skill", "audit skill", "improve skill", "retrospective on skill", "what's wrong with this skill", "skill health check"

## Reference Material

- **Prompting Standards:** `../Standards/PromptingStandards.md`
- **Skill System Spec:** `../Standards/SkillSystem.md`
- **Target skill's SkillIntent.md** (if present)

## Purpose

Single quality workflow covering audit, improvement, and retrospective analysis. Replaces separate audit, improve, and retrospective workflows with mode detection.

## Mode Detection

| User Intent | Mode | Focus |
|---|---|---|
| "audit skill", "check skill health" | Audit | Structural + content validation |
| "improve skill", "what's wrong with skill" | Improve | Identify issues, propose and apply fixes |
| "retrospective on skill" | Retrospective | Session-based analysis of what worked/didn't |

## Workflow Steps

1. Run `ExploreSkill.ts` on target skill to get full snapshot
2. Run `ValidateSkill.ts` on target skill for structural checks
3. Review against target skill's SkillIntent.md success criteria (if exists)
4. Evaluate against review patterns (below)
5. Report findings with PASS/WARN/FAIL per area
6. Ask user which improvements to apply, then execute selected changes

## Review Patterns

- **Signal density:** Is every line in SKILL.md needed for agent decision-making?
- **Routing clarity:** Can an agent unambiguously match user intent to a workflow?
- **Scope boundaries:** Are in-scope/out-of-scope clearly defined?
- **Example quality:** Are examples realistic and representative?
- **Progressive disclosure:** Is content at the right layer (routing vs workflow vs reference)?
- **Trigger coverage:** Do trigger phrases cover natural ways users would invoke?
- **Structural compliance:** Does the skill match SkillSystem.md requirements?

## After Completion

After completing the review, run `ValidateSkill.ts` on the target skill.
