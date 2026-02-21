# SkillIntent: CodeReview

## Purpose

Comprehensive multi-agent code review that is trustworthy, proportional, and single-session. The skill exists because AI code review has a fundamental credibility problem: it flags things that were already broken, flags things that don't matter, and produces walls of text that reviewers learn to ignore.

This skill solves all three problems with three core mechanisms:
1. **Parallel specialization** — multiple agents each go deep in one domain rather than one agent going shallow across all
2. **Claim verification** — every issue is git-blame confirmed to have been introduced in the changed commits
3. **Report design** — output is structured so the user reads every word, not skims

## Design Decisions

**Why a 5-step pipeline, not a single "review everything" prompt?**
Single-prompt reviews are limited by context — the diff, the skill knowledge, and the output all compete for the same token budget. The pipeline separates concerns: GatherContext compresses, DelegateAgents parallelizes, SynthesizeFindings merges, VerifyClaims validates, GenerateReport formats. Each step can be optimized and improved independently.

**Why context compression before agent dispatch?**
Agents are expensive. Giving each agent the full codebase context + full diff + full skill knowledge risks context overflow and reduces focus. The context layer gives agents exactly what they need and nothing else.

**Why git blame verification?**
This was the user's explicit requirement and the most important credibility mechanism. An AI review that flags pre-existing issues — that the team already knows about and has decided to live with — immediately loses credibility. Once credibility is lost, the whole report gets ignored. Verification is not optional.

**Why "what passed clean" in the report?**
The absence of issues is signal, not silence. Telling the user "your TypeScript types are solid, no issues found" is credibility-building. It tells the user the agent actually looked, not just that it didn't flag anything.

## Success Criteria

1. Every flagged issue exists in lines introduced by the commit range being reviewed
2. Agent count and skill selection are proportional to the size and nature of the changes
3. The full review runs in a single session without context overflow
4. The report is readable without skimming — the user engages with every finding
5. Verified claim count is surfaced ("17/19 findings verified")
6. Architecture map gives a coherent picture of what changed structurally

## Explicit Out-of-Scope

- **Refactoring suggestions on unchanged code** — only review what changed
- **Style nitpicks** — only surface if they create bugs or maintainability problems; suggestions section at most
- **Linter-catchable issues** — assume linters run in CI; don't duplicate their work
- **Security audits of the entire codebase** — scope is the diff, not the repo
- **Test generation** — a separate concern; note missing test coverage as a finding, but don't write tests

## Evolution Notes

*2026-02-18: Initial shell created. Workflows GatherContext and DelegateAgents are specified; SynthesizeFindings, VerifyClaims, and GenerateReport are stubbed with TODOs. Priority for next iteration: define SynthesizeFindings deduplication strategy and GenerateReport template.*

*2026-02-21: Retrospective from Bridge Convention App session (f3950440). Root cause: agent never read Review.md, bypassed entire 5-stage pipeline, did single-agent review with no git blame verification. Fixes applied: (1) Pipeline Discipline section added to SKILL.md with mandatory enforcement language, (2) SynthesizeFindings completed with dedup strategy and architectural map generation, (3) VerifyClaims completed with git blame commands and decision tree, (4) GenerateReport completed with finding card format and report template, (5) Notification placement fixed in Review.md — now appears before any actions, (6) Agent-count announcement added to DelegateAgents.md Step 5.*

*2026-02-21: Follow-up — context-driven dimensionality. User passed `/CodingStandards` as argument but it was silently ignored. Root insight: agent dimensionality should emerge from ALL context signals (fingerprint + requested lenses + intent + architecture), not from separate special-cased paths. Fixes: (1) DelegateAgents Step 2 rewritten as unified "Construct Review Dimensions" from context signals, (2) Skill arguments folded into Review.md Step 1 scope as "additional lenses", (3) GatherContext context layer includes "Requested lenses" field, (4) SKILL.md examples updated showing `/CodeReview /SkillName` pattern.*
