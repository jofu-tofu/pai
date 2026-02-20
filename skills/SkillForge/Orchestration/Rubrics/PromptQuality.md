# Prompt Quality — Evaluation Rubric

> Agent-ingestible rubric for the prompt quality dimension.
> NOT an executable workflow — consumed by AgentEvalOrchestrator agents.

## Focus

Evaluate the wording quality of a skill's USE WHEN clause, trigger phrases, and workflow descriptions against Claude 4.x prompting best practices.

## Reference Material

From the **target skill**, read:
- `SKILL.md` — `description` frontmatter (the USE WHEN clause), routing table trigger phrases
- All workflow files in `Workflows/` — read `> **Trigger:**` headers and `## Purpose` sections

From **SkillForge**, read:
- `Standards/PromptingStandards.md` — the authoritative wording and trigger phrase quality rules

## Rubric

| # | Criterion | PASS | WARN | FAIL |
|---|-----------|------|------|------|
| PQ-1 | USE WHEN clause structure | Starts with imperative verb or "USE WHEN"; contains concrete signal words a user would say; no XML tags | USE WHEN present but uses category descriptions instead of specific phrases | Missing USE WHEN clause, uses XML tags, or contains no concrete signal words |
| PQ-2 | USE WHEN uniqueness | Distinguishable from other skills' USE WHEN clauses; no semantic overlap causing cross-skill ambiguity | Minor overlap with 1 other skill's triggers | Significant overlap — USE WHEN clause could equally describe another skill |
| PQ-3 | Trigger phrase length | All trigger phrases are 2-6 words | 1-2 phrases are 7 words or 1 word (borderline) | Multiple phrases exceed 6 words or are single generic words that over-trigger |
| PQ-4 | Trigger phrase natural language | All phrases pass the "say it aloud" test — a real user would naturally say them | 1-2 phrases are jargon-heavy but still usable | Multiple phrases use internal jargon no user would say unprompted |
| PQ-5 | Trigger phrase specificity | Each phrase unambiguously indicates its target workflow | 1 phrase could match 2 workflows but context usually disambiguates | Multiple phrases are ambiguous between workflows |
| PQ-6 | No inter-workflow overlap | No two workflows share semantically equivalent trigger phrases | Minor overlap between 2 workflows on 1 phrase | Systematic trigger overlap across 3+ workflows |
| PQ-7 | Verb clarity | Each trigger phrase makes the intended action obvious | 1-2 phrases have unclear action intent | Multiple phrases where users can't tell what will happen |
| PQ-8 | Workflow purpose consistency | Each workflow file's `## Purpose` section is consistent with its trigger phrases and routing table entry | Minor drift between purpose and triggers | Purpose describes a different action than what triggers imply |
