# Behavioral Resilience — Evaluation Rubric

> Agent-ingestible rubric for the behavioral resilience quality dimension.
> NOT an executable workflow — consumed by AgentEvalOrchestrator agents.

## Focus

Evaluate whether a skill handles edge cases, enforces constraints, and degrades gracefully when inputs are unexpected, incomplete, or adversarial.

## Reference Material

From the **target skill**, read:
- `SkillIntent.md` — extract `## Constraints` and `## Design Decisions` (especially "Alternatives Rejected")
- `SKILL.md` — extract any `## Key Constraints` or behavioral boundaries
- All workflow files in `Workflows/` — examine step logic for edge case handling, error paths, and constraint enforcement

## Rubric

| # | Criterion | PASS | WARN | FAIL |
|---|-----------|------|------|------|
| BR-1 | Missing input handling | Workflows explicitly handle cases where required user input is missing (prompt for it or report error clearly) | Some workflows handle missing input, others silently assume | Workflows proceed with missing input, causing silent failures or undefined behavior |
| BR-2 | Constraint enforcement | Every constraint in SkillIntent.md `## Constraints` is enforced by at least one workflow step or guard | Most constraints enforced, 1-2 rely on implicit agent behavior | Multiple constraints stated but not enforced in any workflow |
| BR-3 | Design decision preservation | No workflow step reintroduces an "Alternative Rejected" from SkillIntent.md `## Design Decisions` | Minor ambiguity where a step could be interpreted as reintroducing a rejected alternative | A workflow explicitly implements a pattern that was documented as rejected |
| BR-4 | Error reporting clarity | When a workflow encounters an error or invalid state, it reports the issue clearly with actionable guidance | Errors are reported but guidance is vague or missing | Errors are swallowed silently or produce cryptic output |
| BR-5 | Scope boundary enforcement | Workflows that should not handle certain request types (documented in "Not this workflow if" sections) have clear routing guidance | Scope boundaries are implied but not explicitly documented | No scope boundaries documented — skill could over-trigger on out-of-scope requests |
| BR-6 | Graceful degradation | When optional components are missing (e.g., SkillIntent.md absent), workflows degrade gracefully with warnings rather than failing | Degradation works but messaging is unclear | Workflow fails hard when an optional component is missing |
| BR-7 | Idempotency where expected | Operations that should be safe to re-run (validation, audit, analysis) produce consistent results without side effects | Minor side effects on re-run (e.g., duplicate log entries) | Re-running an audit or validation produces different results or corrupts state |
