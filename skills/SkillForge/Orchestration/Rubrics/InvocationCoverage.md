# Invocation Coverage — Evaluation Rubric

> Agent-ingestible rubric for the invocation coverage quality dimension.
> NOT an executable workflow — consumed by AgentEvalOrchestrator agents.

## Focus

Evaluate whether the full space of realistic user invocations routes correctly — covering direct triggers, synonym variants, problem-statement invocations, ambiguous prompts, and out-of-scope detection.

## Reference Material

From the **target skill**, read:
- `SKILL.md` — `description` frontmatter (USE WHEN clause), routing table (all trigger phrases), examples section
- All workflow files in `Workflows/` — read `> **Trigger:**` headers and `## Purpose` sections
- Any context files referenced by workflows

From **SkillForge**, read:
- `Standards/PromptingStandards.md` — trigger phrase quality standards

## Rubric

Evaluate by generating at minimum 15 test invocation scenarios across these categories and judging routing outcomes.

| # | Criterion | PASS | WARN | FAIL |
|---|-----------|------|------|------|
| IC-1 | Direct trigger coverage | All routing table trigger phrases used verbatim route to the correct workflow | — | Any verbatim trigger phrase routes to the wrong workflow or fails to route |
| IC-2 | Synonym coverage | Common synonyms and verb variants of trigger phrases (improve/enhance/fix/tweak/update) route correctly | 1-2 synonym variants misroute or fail to route | Multiple common synonyms fail to reach any workflow |
| IC-3 | Problem-statement routing | User describing symptoms ("skill isn't triggering", "workflow not working") routes to an appropriate workflow | Symptom descriptions route but to a suboptimal workflow | Symptom descriptions fall through with no routing |
| IC-4 | Ambiguous prompt handling | Vague prompts ("make skill better", "improve skill") route to a reasonable default workflow | Vague prompts route but choice is debatable | Vague prompts cause no routing or route to clearly wrong workflow |
| IC-5 | Out-of-scope detection | Requests that should NOT trigger this skill correctly do not trigger it | 1 borderline over-trigger on a related but out-of-scope request | Skill triggers on clearly unrelated requests |
| IC-6 | No dead routes | Every workflow in the routing table has at least 1 realistic user invocation that would reach it | 1 workflow has very narrow trigger coverage | A workflow exists in the routing table but no realistic user prompt would reach it |
| IC-7 | Intra-workflow depth | For workflows with named modes, conditional branches, or required inputs, the user's prompt provides enough context to navigate internal paths | 1-2 workflows require clarification the user didn't provide but can recover via prompting | Workflows with internal branches silently pick wrong paths or fail without asking |
| IC-8 | Content-chain enforcement | When a workflow reads a reference file, the agent applies its rules to shape output | Minor rule not applied but non-critical | Workflow reads reference file but ignores its constraints in output |
