# Content Coherence — Evaluation Rubric

> Agent-ingestible rubric for the content coherence quality dimension.
> NOT an executable workflow — consumed by AgentEvalOrchestrator agents.

## Focus

Evaluate whether a skill's content semantically delivers on its stated purpose — does the description match capabilities, do workflows fulfill the intent, and do steps cohere internally?

## Reference Material

From the **target skill**, read:
- `SkillIntent.md` — extract `## Problem This Skill Solves`, `## Success Criteria`, `## Constraints`, `## Design Decisions`
- `SKILL.md` — extract `description` frontmatter, routing table, examples
- All workflow files in `Workflows/` — read purpose headers, step sequences, Follow-Up sections

From **SkillForge**, read:
- `Standards/PromptingStandards.md` — wording quality rules (for trigger phrase coherence evaluation)

## Rubric

| # | Criterion | PASS | WARN | FAIL |
|---|-----------|------|------|------|
| CC-1 | Promise vs. delivery | SKILL.md description accurately reflects what workflows can do; no promised capabilities without a delivering workflow | Minor gap — 1 capability implied in description but not fully covered by workflows | Description promises capabilities no workflow delivers, or workflows deliver capabilities not mentioned |
| CC-2 | Intent vs. implementation | Every workflow's step sequence logically achieves part of the stated `## Problem This Skill Solves` | 1-2 workflows are loosely connected to the stated problem | Workflow instructions contradict `## Constraints` or `## Design Decisions` |
| CC-3 | Step coherence | Workflow steps follow a logical sequence with no circular references or gaps; output of step N is available when needed by step N+1 | Minor ordering issue — steps work but sequence is suboptimal | Steps reference outputs not yet produced, or contain circular dependencies |
| CC-4 | Instruction specificity | Workflow step instructions are specific enough that two different agents would produce similar results | 1-2 steps contain vague instructions ("as appropriate", "if needed" without criteria) | Multiple steps with vague qualifiers that cause agent divergence |
| CC-5 | Success Criteria coverage | Every Success Criterion in SkillIntent has at least one workflow step, chain condition, or Follow-Up that enforces it | Most criteria enforced; 1-2 are partially covered | Multiple Success Criteria stated but never checked — dead criteria |
| CC-6 | Example accuracy | Examples in SKILL.md reflect actual workflow behavior and realistic user prompts | Examples are plausible but slightly outdated or simplified | Examples show workflows or behaviors that don't exist in the skill |
| CC-7 | Rejected alternatives preserved | No workflow reimplements a pattern documented as "Alternative Rejected" in SkillIntent Design Decisions | Ambiguous case where interpretation could go either way | A rejected alternative is clearly reimplemented in a workflow |
