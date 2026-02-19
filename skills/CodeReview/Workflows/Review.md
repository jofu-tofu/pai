# Review Workflow

The single user-facing entry point for code review. Orchestrates all pipeline stages in sequence.

## Reference Material

- `../SkillIntent.md` — Design decisions, success criteria, explicit out-of-scope

## Step 1: Establish Scope

Determine what to review. Ask if not clear from context:

- **Branch:** "Which branch or commit range? (default: current branch vs main)"
- **PR:** "PR number or URL?"
- **Scoped:** "Any specific files or areas to focus on, or full diff?"

If the user said "last N commits" → compute range: `git log --oneline -N` to find the SHA.

```bash
# Confirm what's in scope before proceeding
git log main...HEAD --oneline
git diff main...HEAD --stat
```

Show the user a one-line summary: "I'll review N commits touching X files (+Y/-Z lines). Proceeding..."

## Step 2: Gather Context (internal — GatherContext.md)

Read and execute: `Workflows/GatherContext.md`

Produces: `_output/contexts/[slug]/notes/CodeReview-Context.md`

Confirm the context layer with the user before proceeding:
> "Here's what I understand about this change: [intent summary]. Does this look right?"

If corrections → update context layer, then continue.

## Step 3: Delegate Agents (internal — DelegateAgents.md)

Read and execute: `Workflows/DelegateAgents.md`

Uses the context layer's change fingerprint to:
- Select relevant skills
- Determine agent count (Small: 2, Medium: 3-4, Large: 5-8)
- Spawn agents in parallel

Announce to user: "Launching N agents in parallel: [domain list]. This may take a moment..."

## Step 4: Synthesize Findings (internal — SynthesizeFindings.md)

Read and execute: `Workflows/SynthesizeFindings.md`

Merges and deduplicates all agent outputs into unified findings.

## Step 5: Verify Claims (internal — VerifyClaims.md)

Read and execute: `Workflows/VerifyClaims.md`

**This step is non-negotiable.** Every finding must be confirmed against the commit range before surfacing. Discards pre-existing issues silently (optionally shows them in appendix).

Announce: "Verifying N findings against commit range..."

## Step 6: Generate Report (internal — GenerateReport.md)

Read and execute: `Workflows/GenerateReport.md`

Produces the final structured report:
- Verdict (2-3 sentence summary)
- Architectural map
- Severity-ordered findings (CRITICAL → HIGH → MEDIUM → LOW → SUGGESTIONS)
- What passed clean (credibility signal)
- Optional: Pre-existing issues appendix

## Step 7: Deliver

Output the report directly in the conversation. Also write to:
`_output/contexts/[slug]/notes/CodeReview-Report.md`

---

## Flags (recognized from user's request)

| User Says | Behavior |
|-----------|----------|
| "quick review" / "fast review" | Skip MEDIUM/LOW findings; CRITICAL + HIGH only |
| "focus on [area]" | Scope diff to matching files |
| "post to PR" | After report, run `gh pr comment` with summary |
| "no agents" / "just you" | Single-agent review, skip DelegateAgents parallelism |

## TODO

- [ ] Define progress reporting between steps — what does the user see while agents run?
- [ ] Define abort/resume — if session ends mid-review, can it resume from a step?
- [ ] Define behavior when diff is empty (nothing changed vs wrong branch)
- [ ] Define behavior when no issues found (don't return empty — explain what was checked)
