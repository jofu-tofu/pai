# Git Commit Patterns for DLG Extraction

This document explains how Epic developers reference DLG numbers in git commits and how to extract that information programmatically.

---

## DLG Number Pattern

Epic uses a consistent pattern for referencing DLG numbers in commit messages:

**Pattern:** `dlg-NNNNNNN` (lowercase "dlg" followed by hyphen and 7-digit number)

**Examples:**
- `dlg-2282544`
- `dlg-1234567`
- `dlg-9876543`

**Regex:** `dlg-\d{7}`

---

## Commit Message Conventions

### Typical Commit Format

```
<type>(<scope>): <subject> [dlg-NNNNNNN]

<body>

DLG: dlg-NNNNNNN
```

**Example:**
```
feat(keyboard): Add accessibility shortcuts for navigation [dlg-2282544]

Implemented keyboard shortcuts for common navigation actions:
- Tab/Shift+Tab for focus movement
- Enter/Space for activation
- Escape for dismissal

DLG: dlg-2282544
```

### Common Patterns

**In Subject Line:**
- `feat: Add feature [dlg-1234567]`
- `fix: Resolve issue [dlg-1234567]`
- `refactor: Improve code [dlg-1234567]`

**In Body:**
- `DLG: dlg-1234567`
- `Related DLGs: dlg-1234567, dlg-7654321`
- `Fixes dlg-1234567`

**Conventional Commit Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code restructure without behavior change
- `test:` - Test additions or corrections
- `docs:` - Documentation updates
- `chore:` - Build/tooling changes

---

## Git Commands for DLG Extraction

### Find All Commits for a DLG

**Command:**
```bash
git log --all --grep="dlg-NNNNNNN" --oneline
```

**Options:**
- `--all` - Search all branches (not just current branch)
- `--grep="dlg-NNNNNNN"` - Filter commit messages containing the DLG pattern
- `--oneline` - Show abbreviated commit hash and subject only

**Example:**
```bash
git log --all --grep="dlg-2282544" --oneline
```

**Output:**
```
a1b2c3d feat(keyboard): Add accessibility shortcuts [dlg-2282544]
e4f5g6h fix(keyboard): Resolve focus trap issue [dlg-2282544]
```

### Show Full Commit Details

**Command:**
```bash
git log --all --grep="dlg-NNNNNNN" --pretty=fuller
```

**Shows:**
- Full commit hash
- Author and date
- Committer and date
- Full commit message body
- Not file changes (use `git show` for that)

### Show Commits with File Changes

**Command:**
```bash
git log --all --grep="dlg-NNNNNNN" --stat
```

**Output includes:**
- Commit hash and message
- Files changed
- Lines added/removed per file
- Summary statistics

**Example:**
```bash
git log --all --grep="dlg-2282544" --stat
```

### Show Full Diff for Each Commit

**Command:**
```bash
git log --all --grep="dlg-NNNNNNN" -p
```

**Shows:**
- Full unified diff for every commit
- WARNING: Can be very large output if many files changed
- Use sparingly or with `--max-count=N` to limit results

### Get Just Commit Hashes

**Command:**
```bash
git log --all --grep="dlg-NNNNNNN" --pretty=format:"%H"
```

**Output:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3
```

### Extract DLG Number from Current Commit

**Command:**
```bash
git log -1 --format=%B | grep -oP 'dlg-\d{7}'
```

**Explanation:**
- `git log -1 --format=%B` - Get body of last commit
- `grep -oP 'dlg-\d{7}'` - Extract DLG pattern using Perl regex

---

## Repository Scope

**Current Implementation:**
- Searches **current working directory's git repository only**
- Does not search across multiple repos
- Requires being in a git repository (fails gracefully if not)

**Future Enhancement:**
- Multi-repo search by reading workspace configuration
- Specify custom repo paths
- Search Epic monorepo if accessible

---

## Edge Cases

### Multiple DLGs in One Commit

**Pattern:**
```
feat: Implement features [dlg-1234567] [dlg-7654321]

DLG: dlg-1234567
Related DLGs: dlg-7654321, dlg-9999999
```

**Extraction:**
```bash
git log -1 --format=%B | grep -oP 'dlg-\d{7}' | sort -u
```

**Output:**
```
dlg-1234567
dlg-7654321
dlg-9999999
```

### No DLG Reference

Some commits may not reference a DLG (internal refactoring, tooling changes). These are normal and expected.

### DLG in File Path

**Pattern:** Some repos organize code by DLG number in directories:
```
src/dlg-1234567/feature.ts
```

**Command to find:**
```bash
git log --all --name-only | grep "dlg-\d{7}"
```

---

## Workflow Integration

### Typical Usage in AnalyzeCommits Workflow

1. **Extract DLG number** from user input or previous workflow context
2. **Search git history** with `git log --all --grep="dlg-{NUMBER}"`
3. **Show commit list** with one-line summaries
4. **Offer drill-down** - user can request `git show <hash>` for specific commits
5. **Handle edge cases:**
   - Not in git repo → Display message, skip analysis
   - No commits found → Display "No git commits found for this DLG"
   - Multiple commits → Show all (don't paginate in shell phase)

### Example Output Format

```
Git commits for dlg-2282544:

1. a1b2c3d (2024-01-15) feat(keyboard): Add accessibility shortcuts
   Files: src/keyboard.ts, tests/keyboard.test.ts (+120, -5 lines)

2. e4f5g6h (2024-01-18) fix(keyboard): Resolve focus trap issue
   Files: src/keyboard.ts (+15, -3 lines)

3. i9j0k1l (2024-01-20) test(keyboard): Add integration tests
   Files: tests/integration/keyboard.spec.ts (+85, -0 lines)

Total: 3 commits across 2 weeks

Next: Type 'show commit a1b2c3d' to see full diff
```

---

## References

- **Git Documentation:** https://git-scm.com/docs/git-log
- **Conventional Commits:** https://www.conventionalcommits.org/
- **Grep Regex:** `man grep` (PCRE with -P flag)
