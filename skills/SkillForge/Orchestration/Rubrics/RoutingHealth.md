# Routing Health — Evaluation Rubric

> Agent-ingestible rubric for the routing health quality dimension.
> NOT an executable workflow — consumed by AgentEvalOrchestrator agents.

## Focus

Evaluate whether a skill's routing table, file structure, and trigger phrases form a consistent and healthy system — files match routes, routes match files, and live operations work correctly.

## Reference Material

From the **target skill**, read:
- `SKILL.md` — routing table (workflow names, triggers, file paths), description frontmatter
- All workflow files in `Workflows/` — read `> **Trigger:**` header lines
- Any context files listed in a `## Context Files` section

From **SkillForge**, read:
- `Standards/SkillSystem.md` — routing table format requirements

## Rubric

| # | Criterion | PASS | WARN | FAIL |
|---|-----------|------|------|------|
| RH-1 | No orphan references | Every file path in the routing table exists on disk | — | Any routing table entry references a file that does not exist |
| RH-2 | No ghost files | Every `Workflows/*.md` on disk appears in the routing table or is marked internal | 1 unrouted file that appears intentionally internal | Multiple workflow files with no routing entry and no internal marker |
| RH-3 | Trigger consistency | For each workflow, the routing table trigger phrases are semantically consistent with the workflow file's `> **Trigger:**` header | Minor wording differences that preserve meaning | Routing table triggers and workflow file triggers describe different actions |
| RH-4 | No trigger overlap | No two workflows share semantically equivalent trigger phrases | 2 workflows have 1 overlapping phrase but different enough context | Multiple workflows with overlapping triggers causing ambiguous routing |
| RH-5 | Context file reachability | All files listed in `## Context Files` (if section exists) are present on disk | — | Any context file is referenced but missing from disk |
| RH-6 | Routing table format correct | Table uses `| Workflow | Trigger | File |` format with bold workflow names | Minor formatting inconsistency | Table is malformed, missing columns, or not a proper markdown table |
| RH-7 | Canary operation viable | Skill has a ManageWorkflows-equivalent workflow that can add/remove workflows | Skill has no ManageWorkflows equivalent (acceptable for simple skills) | ManageWorkflows equivalent exists but would fail to maintain routing consistency |
| RH-8 | Description routing signal | SKILL.md `description` frontmatter contains enough signal for Claude to route to this skill correctly | Description is adequate but could be more specific | Description is vague, over-triggers on unrelated requests, or lacks `USE WHEN` clause |
