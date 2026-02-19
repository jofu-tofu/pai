# SynthesizeFindings Workflow

Aggregate outputs from all parallel agents into a unified, deduplicated, prioritized findings list.

## Purpose

Multiple agents reviewing the same diff will overlap. The TypeScript agent and the General agent may both flag the same null check. This workflow collapses duplicates, resolves conflicts, and produces a single coherent findings list ordered by severity and significance.

## TODO

- [ ] Define deduplication strategy — how to recognize when two agents flagged the same issue (same file + line range vs. semantic similarity)
- [ ] Define conflict resolution — when agents disagree (one says CRITICAL, another says LOW for same line), who wins? Or do we surface both with a note?
- [ ] Define grouping strategy — should findings be grouped by file, by severity, by agent, or by domain?
- [ ] Define architectural map generation — if multiple files in the same module changed, how do we produce a coherent "here's what changed architecturally" summary
- [ ] Define the output schema for findings that VerifyClaims can operate on
- [ ] Handle the case where an agent returned no findings (is that a pass or a failure to review?)

## Inputs

- Raw agent outputs from `_output/contexts/[context-slug]/notes/CodeReview-AgentOutputs.md`
- Context layer from `_output/contexts/[context-slug]/notes/CodeReview-Context.md`

## Expected Output

A unified findings document at `_output/contexts/[context-slug]/notes/CodeReview-Findings.md`:

```markdown
## Synthesized Findings

**Total issues:** N
**By severity:** CRITICAL: X | HIGH: Y | MEDIUM: Z | LOW: W | SUGGESTIONS: V

### CRITICAL
[...]

### HIGH
[...]

### Architectural Map
[Which modules/components changed and how they relate]

### What Agents Found Nothing Wrong With
[Domains that passed clean — builds credibility]
```

## Follow-Up

Always chains to → **VerifyClaims**
