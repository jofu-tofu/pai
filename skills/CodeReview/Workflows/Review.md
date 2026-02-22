# Review Workflow

The single user-facing entry point for code review. Orchestrates all pipeline stages in sequence.

**FIRST ACTION — Output the workflow notification immediately:**
```
Running the **Review** workflow from the **CodeReview** skill...
```
Do this BEFORE reading any source code, diffs, or other files. The notification signals to the user that the pipeline is starting.

## Reference Material

- `../SkillIntent.md` — Design decisions, success criteria, explicit out-of-scope

## Step 1: Establish Scope and Review Mode

Determine what to review and which **review mode** applies.

**Mode detection** — determine from the user's request:

| User Intent | Review Mode | Next Action |
|-------------|-------------|-------------|
| "review my PR", "review commits", "review this branch", "what did I change" | **diff** | Establish commit range below |
| "audit this module", "review this directory", "audit the auth code", "review src/components" | **audit** | Establish target path below |
| Ambiguous (e.g., "review the codebase") | Ask | "Are you reviewing recent changes (diff) or auditing existing code (audit)?" |

### Diff Mode — Establish Commit Range

Ask if not clear from context:
- **Branch:** "Which branch or commit range? (default: current branch vs main)"
- **PR:** "PR number or URL?"
- **Scoped:** "Any specific files or areas to focus on, or full diff?"

If the user said "last N commits" → compute range: `git log --oneline -N` to find the SHA.

```bash
# Confirm what's in scope before proceeding
git log main...HEAD --oneline
git diff main...HEAD --stat
```

Show the user a one-line summary: "I'll review N commits touching X files (+Y/-Z lines). [Additional lenses: SkillName1, SkillName2.] Proceeding..."

### Audit Mode — Establish Target Path

Ask if not clear from context:
- **Target:** "Which directory, module, or file set?" (e.g., `src/auth/`, `lib/`, specific file list)
- **Focus:** "Any specific concerns? (architecture, simplification, security, general health)"

```bash
# Understand the target
find [target-path] -type f | head -100
find [target-path] -type f | wc -l
```

Show the user a one-line summary: "I'll audit [target path] — N files across M directories. [Additional lenses: SkillName1, SkillName2.] Proceeding..."

### Additional Lenses (both modes)

Check if the user passed skill names as arguments (e.g., `/CodeReview /CodingStandards /TestDriven`). These are context signals that influence which review dimensions get constructed in DelegateAgents. Pass them to GatherContext alongside the commit range (diff) or target path (audit).

## Step 2: Gather Context (internal — GatherContext.md)

Read and execute: `Workflows/GatherContext.md`

Produces: `$REVIEW_DIR/context.md` (in `_output/contexts/[context-slug]/reviews/codereview/[timestamp]/`)

Confirm the context layer with the user before proceeding:
> "Here's what I understand about this change: [intent summary]. Does this look right?"

If corrections → update context layer, then continue.

## Step 3: Delegate Agents (internal — DelegateAgents.md)

Read and execute: `Workflows/DelegateAgents.md`

Uses the context layer's change fingerprint to:
- Select relevant skills
- Determine agent count (Small: up to 4, Medium: up to 8, Large: up to 12)
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

Output the report directly in the conversation. Also write to `$REVIEW_DIR/report.md`

---

## Flags (recognized from user's request)

| User Says | Behavior |
|-----------|----------|
| "quick review" / "fast review" | Skip MEDIUM/LOW findings; CRITICAL + HIGH only |
| "focus on [area]" | Scope diff to matching files |
| "post to PR" | After report, run `gh pr comment` with summary |
| "no agents" / "just you" | Single-agent review, skip DelegateAgents parallelism |
| `/SkillName` as argument | Additional context signal for dimension construction (see Step 1) |

## TODO

- [ ] Define progress reporting between steps — what does the user see while agents run?
- [ ] Define abort/resume — if session ends mid-review, can it resume from a step?
- [ ] Define behavior when diff is empty (nothing changed vs wrong branch)
- [ ] Define behavior when no issues found (don't return empty — explain what was checked)
