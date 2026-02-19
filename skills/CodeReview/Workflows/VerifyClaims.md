# VerifyClaims Workflow

**The credibility gate.** Every flagged issue must be verified to exist in lines introduced by the specified commit range before it reaches the user. This is what separates a trustworthy review from an embarrassing one.

## Purpose

The single biggest credibility killer in AI code review: flagging an issue that was already there before the change, or that was fixed in a later commit within the same range. The user looks at the code, sees it's fine, and stops trusting everything else in the report.

This workflow runs `git blame` and `git log` probes against every flagged line to confirm:
1. The line was introduced (or modified) by a commit within the review range
2. The line hasn't been subsequently fixed by a later commit in the same range

## Step 1: For Each Finding

For each issue in `CodeReview-Findings.md`, run:

```bash
# Who introduced this line?
git blame -L [line],[line] [filename] --porcelain

# Was this commit in our review range?
git log [range] --oneline | grep [commit-sha]
```

**Decision tree:**
- Commit IS in range → ✓ VERIFIED — keep finding
- Commit is NOT in range → ✗ DISCARD — pre-existing issue, not introduced by these changes
- Commit is in range but a later commit in range fixed it → ✗ DISCARD — self-corrected within this PR

## Step 2: Handle Edge Cases

**New files:** All lines are new — auto-verified, skip git blame
**Deleted code:** Verify the deletion is intentional vs. accidental removal
**Renamed files:** Follow renames with `git log --follow`
**Generated code:** Flag as "generated — human review recommended" rather than discarding

## TODO

- [ ] Define what to do with findings that cannot be verified (blame data unavailable, binary files, generated code)
- [ ] Define confidence scoring — should we surface lower-confidence findings separately rather than discarding?
- [ ] Consider: run a "sanity check" pass — pick 2-3 CRITICAL findings and manually verify them before running full verification
- [ ] Define how to handle merge commits and rebased history (SHA may not match cleanly)
- [ ] Consider surfacing verified vs. unverified count as a credibility signal in the report ("17/19 findings verified, 2 could not be confirmed")
- [ ] Define behavior when the git repo history is shallow (GitHub Actions shallow clone, etc.)

## Output

Write verification results back to findings:
- Mark each finding: ✓ VERIFIED | ✗ DISCARDED (pre-existing) | ⚠ UNVERIFIED
- Remove discarded findings from the main findings list
- Optionally keep discarded findings in an appendix: "Pre-existing issues (not introduced by this change)"

Update `_output/contexts/[context-slug]/notes/CodeReview-Findings.md` with verification status.

## Follow-Up

Always chains to → **GenerateReport**
