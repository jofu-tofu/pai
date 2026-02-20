# First Principles — Evaluation Rubric

> Agent-ingestible rubric for the first principles quality dimension.
> NOT an executable workflow — consumed by AgentEvalOrchestrator agents.

## Focus

Evaluate whether a skill's implementation embodies its own stated First Principles and SkillForge's structural First Principles.

## Reference Material

From the **target skill**, read:
- `SkillIntent.md` — extract `## First Principles` section (the skill's own principles)
- `SKILL.md` — extract description, routing table, examples
- All workflow files in `Workflows/` — examine step logic against principles

From **SkillForge**, read:
- `SkillIntent.md` — extract SkillForge's First Principles (signal density, user-workflow-first, WHY endures, progressive disclosure)

## Rubric

| # | Criterion | PASS | WARN | FAIL |
|---|-----------|------|------|------|
| FP-1 | Target skill's own First Principles alignment | Every principle has clear evidence of embodiment in skill content | 1-2 principles show drift — content partially contradicts the principle | Any principle is directly contradicted by skill content |
| FP-2 | Signal density over completeness | No duplicated content across files; every section earns its token cost | Minor duplication found (same info in 2 places) or 1 section adds little value | Significant duplication across files or multiple sections that add no value |
| FP-3 | User-workflow-first routing | Routing table contains only workflows a user would naturally invoke; internal stages are absent | 1 borderline entry — could be internal or user-facing | Internal pipeline stages appear in the routing table |
| FP-4 | The WHY endures, the WHAT changes | No implementation-specific references (step numbers, exact file paths, log formats) embedded in intent/constraint docs | Minor implementation leakage in 1-2 places | SkillIntent or constraint sections contain step numbers, exact paths, or format details that will break on refactor |
| FP-5 | Progressive disclosure correctness | Each content piece lives at the correct architectural layer (SKILL.md=routing, Workflows=procedures, Context=reference, SkillIntent=design) | 1-2 minor layer violations (e.g., a small reference table in SKILL.md) | Content at wrong layers: procedures in SKILL.md, reference material in workflow files, or implementation details in SkillIntent |
| FP-6 | No cross-layer duplication | No content is duplicated across architectural layers | Minor duplication — same info appears at 2 layers but not conflicting | Same content appears at multiple layers with divergent versions |
