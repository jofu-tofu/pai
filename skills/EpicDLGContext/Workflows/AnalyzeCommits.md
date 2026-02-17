# AnalyzeCommits Workflow

**Purpose:** Find all git commits referencing a DLG number and display their code changes.

**Triggers:** "find DLG commits", "show git history for DLG", "what changed in DLG", "git commits for DLG"

---

## Overview

This workflow searches the current git repository for commits that reference a specific DLG number. It shows:
- All commits mentioning the DLG (across all branches)
- Commit metadata (hash, date, author, message)
- Files changed in each commit
- Line counts (additions/deletions)
- Option to view full diffs

**Repository Scope:** Searches current working directory's git repository only. Does not search across multiple repos.

---

## Step 1: Extract DLG Number

[TODO: Parse DLG number from user input or previous workflow context]

**Input Patterns:**
- Direct: "find DLG commits for dlg-2282544"
- From conversation: Read previous GatherContext output for DLG number
- Numeric only: "2282544" → normalize to "dlg-2282544"

**Normalization:**
```bash
# If input is just digits
dlg_number="dlg-${numeric_input}"

# If input includes "dlg-" prefix
dlg_number="${input}"  # use as-is
```

---

## Step 2: Verify Git Repository

[TODO: Check if current directory is in a git repository]

**Command:**
```bash
git rev-parse --git-dir 2>/dev/null
```

**Error Handling:**
- If exit code != 0 → Display message and skip git analysis:
  ```
  ⚠️  Not in a git repository.
  Cannot search for commits. Current directory: {cwd}

  To use this workflow, navigate to a git repository first.
  ```
- Then CONTINUE (not stop) - git analysis is secondary context

---

## Step 3: Search Git History

[TODO: Execute git log command to find commits]

**Command:**
```bash
git log --all --grep="dlg-{NUMBER}" --pretty=format:"%H|%ai|%an|%s" --numstat
```

**Options:**
- `--all` - Search all branches (not just current)
- `--grep="dlg-{NUMBER}"` - Filter by DLG pattern
- `--pretty=format:"%H|%ai|%an|%s"` - Custom format: hash, date, author, subject
- `--numstat` - Show file statistics (lines added/removed)

**Edge Case - No Commits Found:**
If git command returns empty output or exit code indicates no matches:
```
ℹ️  No git commits found for dlg-{NUMBER}

This DLG may have:
- No code changes yet (design-only or planning phase)
- Changes in a different repository
- Changes committed without DLG reference

Next: Type 'traverse DLG links' to explore related records.
```
Then CONTINUE (display message and finish - don't treat as error).

---

## Step 4: Parse and Display Commit List

[TODO: Parse git output and format for display]

**Display ALL commits** - do not paginate or limit results. The shell phase shows everything found.

**Format:**
```
═══════════════════════════════════════════════════════
GIT COMMITS for dlg-{NUMBER}
═══════════════════════════════════════════════════════

Found {count} commits across all branches:

1. {short_hash} ({date})
   Author: {author}
   Message: {commit_subject}
   Files changed: {file_count}
   Lines: +{additions} -{deletions}

2. {short_hash} ({date})
   Author: {author}
   Message: {commit_subject}
   Files changed: {file_count}
   Lines: +{additions} -{deletions}

...

═══════════════════════════════════════════════════════
Total: {count} commits across {time_span}
═══════════════════════════════════════════════════════
```

---

## Step 5: Offer Detailed View Options

[TODO: Present options for viewing full commit details]

**Format:**
```
NEXT STEPS
══════════

View full details for a specific commit:
  "show commit {hash}"     → Display full diff and file changes

View all files changed:
  "list files for DLG"     → Show all unique files across all commits

Continue exploration:
  "traverse DLG links"     → TraverseRelationships workflow
  "find similar DLGs"      → SearchSimilar workflow
```

**Commit Hash Passing:**
Commit hashes are now in conversation context. User can reference them by short hash (first 7 chars) or full hash.

---

## Step 6: Show Commit Details (Optional)

[TODO: If user requests detailed view, execute git show]

**Triggered by:** User typing "show commit {hash}"

**Command:**
```bash
git show {hash} --stat --pretty=fuller
```

**Output includes:**
- Full commit metadata (author, committer, dates)
- Full commit message body
- File change statistics
- Unified diff for each file

**Format:**
```
═══════════════════════════════════════════════════════
COMMIT DETAILS: {hash}
═══════════════════════════════════════════════════════

Commit: {full_hash}
Author: {author} <{email}>
Date: {author_date}

Committer: {committer} <{email}>
Date: {commit_date}

{full_commit_message}

Files Changed:
──────────────
{file_path_1}  | {lines_changed} {+/-}
{file_path_2}  | {lines_changed} {+/-}

Diff:
─────
{unified_diff_output}

═══════════════════════════════════════════════════════
```

---

## Error Cases and Recovery

| Situation | Action | Rationale |
|-----------|--------|-----------|
| Not in git repo | Display message, continue | Git is optional context - don't block workflow |
| No commits found | Display message, continue | Valid state - DLG may have no code changes yet |
| Git command fails | Display error, continue | Transient failure - show what we can |
| Invalid commit hash | Display error | User provided bad hash for "show commit" |
| Repository too large | Show results (may be slow) | No timeout in shell phase - let git finish |

---

## Example Output

```
═══════════════════════════════════════════════════════
GIT COMMITS for dlg-2282544
═══════════════════════════════════════════════════════

Found 3 commits across all branches:

1. a1b2c3d (2024-01-15 14:32:10)
   Author: John Smith
   Message: feat(keyboard): Add accessibility shortcuts
   Files changed: 2
   Lines: +120 -5

2. e4f5g6h (2024-01-18 09:15:45)
   Author: John Smith
   Message: fix(keyboard): Resolve focus trap issue
   Files changed: 1
   Lines: +15 -3

3. i9j0k1l (2024-01-20 16:20:33)
   Author: Jane Doe
   Message: test(keyboard): Add integration tests
   Files changed: 1
   Lines: +85 -0

═══════════════════════════════════════════════════════
Total: 3 commits across 5 days (2024-01-15 to 2024-01-20)
═══════════════════════════════════════════════════════

NEXT STEPS
══════════

View full details for a specific commit:
  "show commit a1b2c3d"    → Display full diff and file changes

View all files changed:
  "list files for DLG"     → Show all unique files across commits

Continue exploration:
  "traverse DLG links"     → TraverseRelationships workflow
  "find similar DLGs"      → SearchSimilar workflow
```

---

## Advanced: List All Files Changed

[TODO: Extract unique file paths across all commits]

**Command:**
```bash
git log --all --grep="dlg-{NUMBER}" --name-only --pretty=format: | sort -u
```

**Output Format:**
```
═══════════════════════════════════════════════════════
ALL FILES CHANGED in dlg-{NUMBER}
═══════════════════════════════════════════════════════

{file_count} unique files modified:

src/keyboard.ts
src/focus-manager.ts
tests/keyboard.test.ts
tests/integration/keyboard.spec.ts
docs/keyboard-shortcuts.md

═══════════════════════════════════════════════════════
```

---

## Related Workflows

- **GatherContext** - Get DLG details from Track (provides DLG number to this workflow)
- **TraverseRelationships** - Explore linked XDS/ZQN/PRJ records
- **SearchSimilar** - Find related DLGs by keywords

---

## Context Documentation

- `GitPatterns.md` - Git commit patterns, DLG extraction regex, search commands
- `TrackContext.md` - DLG structure (for understanding what code changes implement)
