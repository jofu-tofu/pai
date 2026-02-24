# VerifyClaims Workflow

> Internal workflow — invoked by Review.md, not user-facing.

## Input / Output

**Input:**
- List of per-dimension agent output files: `$REVIEW_DIR/dimension-[id].md` (paths provided by orchestrator)
- Path to `$REVIEW_DIR/context.md` (review context, includes review mode)

**Output:**
- Writes verified findings to `$REVIEW_DIR/verified-findings.md`
- Returns the absolute path to `verified-findings.md`

**The credibility gate.** Every flagged issue must be verified to exist in lines introduced by the specified commit range before it reaches the user.

## Purpose

The single biggest credibility killer in AI code review: flagging an issue that was already there before the change, or that was fixed in a later commit within the same range. The user looks at the code, sees it's fine, and stops trusting everything else in the report.

This workflow runs `git blame` and `git log` probes against every flagged line to confirm:
1. The line was introduced (or modified) by a commit within the review range
2. The line hasn't been subsequently fixed by a later commit in the same range

## Step 0: Collect Findings from Agent Outputs

Read each agent output file from the list provided by the orchestrator. For each file, extract all findings (RULE_ID, severity, file, line, description, recommendation). Tag each finding with the dimension that produced it.

Build a unified findings list for verification.

## Mode Selection

Read the context layer's `Mode:` field:

- **`diff`** -> Proceed to Step 1 (git blame verification against commit range)
- **`audit`** -> Skip to Step 1A (file-presence verification — no commit range exists)

## Step 1A: Verify Audit Findings (audit mode only)

In audit mode, there is no commit range. Findings are verified by confirming the cited code actually exists.

For EVERY finding in the findings list:

```bash
# Does the file exist?
test -f [filename] && echo "EXISTS" || echo "MISSING"

# Does the cited line range exist and match the described issue?
sed -n '[start],[end]p' [filename]
```

**Decision tree (audit mode):**

| Condition | Result | Action |
|---|---|---|
| File exists AND cited lines contain the described pattern | VERIFIED | Keep finding in report |
| File exists BUT cited lines don't match the description | MISLOCATED | Mark "Warning: Location uncertain" |
| File does not exist | INVALID | Discard finding |

After verification, skip to Step 3 (tally).

## Step 1: Verify Each Finding (diff mode)

For EVERY finding in the findings list, run:

```bash
# Who introduced this line?
git blame -L [line],[line] [filename] --porcelain | head -1
```

Extract the commit SHA from the first line of porcelain output.

```bash
# Was this commit in our review range?
git log [base]..HEAD --oneline --format="%H" | grep [commit-sha-prefix]
```

**Decision tree:**

| Condition | Result | Action |
|---|---|---|
| Commit SHA IS in the review range | VERIFIED | Keep finding in report |
| Commit SHA is NOT in the review range | PRE-EXISTING | Move to appendix "Pre-existing Issues" |
| Commit IS in range but a LATER commit in range changed the same line | SELF-CORRECTED | Discard — issue was fixed within the PR |
| Cannot determine (binary file, generated code, blame unavailable) | UNVERIFIED | Keep but mark as "Warning: Unverified — manual review recommended" |

**Self-correction check (for VERIFIED findings):**
```bash
# Did a later commit in the range touch this same line?
git log [finding-commit-sha]..HEAD --oneline -- [filename] | head -5
```
If a later commit modified the same file, re-blame the line to check if it was changed.

## Step 2: Handle Special Cases

**New files (all lines new):**
```bash
git log --diff-filter=A --format="%H" -- [filename]
```
If the file was added in the review range -> all lines auto-verified. Skip blame.

**Deleted code:**
The deletion itself is the finding. Verify the deletion commit is in range:
```bash
git log [range] --diff-filter=D -- [filename]
```

**Renamed files:**
```bash
git log --follow --format="%H" -- [filename] | head -5
```

**Generated code (lockfiles, build output):**
Flag as "Generated — human review recommended" rather than VERIFIED or DISCARDED.

## Step 3: Tally Verification Results

Count:
- **VERIFIED:** N findings confirmed in the review range
- **DISCARDED:** M findings were pre-existing (not introduced by this change)
- **UNVERIFIED:** P findings could not be confirmed
- **SELF-CORRECTED:** Q findings were fixed within the same PR

**Output the verification tally — this is a mandatory credibility signal:**
```
Verification: [N]/[total] findings confirmed against changed commits
([M] pre-existing discarded, [P] unverified, [Q] self-corrected)
```

## Step 4: Write Verified Findings

Write to `$REVIEW_DIR/verified-findings.md`:

For each finding, include verification status:
```
Verification: VERIFIED (commit abc1234 in range)
Verification: DISCARDED (commit def5678 predates review range — pre-existing)
Verification: UNVERIFIED (blame data unavailable — generated file)
```

Remove DISCARDED findings from the main findings sections. Move them to an appendix section:

```markdown
### Pre-existing Issues (not introduced by this change)
[Findings that were discarded — kept for awareness, not for action]
```

## Step 5: Announce Results

Output to the user:
```
Verified [N]/[total] findings against commit range [base]..HEAD.
[M] pre-existing issues removed from report.
[P] findings could not be verified (will be flagged in report).
```

## Follow-Up

Returns the path to `verified-findings.md` to the orchestrator. The orchestrator passes this path to the next agent (GenerateReport).
