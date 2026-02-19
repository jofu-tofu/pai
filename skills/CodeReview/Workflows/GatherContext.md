# GatherContext Workflow

Gather everything needed to do a comprehensive review — the changes themselves, and the bigger picture of why they exist — then compress it into a slim context layer that agents can consume without token waste.

## Purpose

Two layers of context are required:
1. **Change context** — What actually changed: the diff, files touched, commit messages, line numbers
2. **Intent context** — Why it changed: PR description, linked ticket, stated goals, architectural decisions

Without both layers, agents make surface-level observations. With both, they can evaluate whether the *approach* is correct, not just whether the *code* is correct.

## Step 1: Determine Commit Range

Ask the user (or infer from context):
- Branch name? (vs main/master)
- Specific commit SHA range? (e.g., `abc123..HEAD`)
- PR URL or number?
- "Last N commits"?

```bash
# Get the diff for a branch
git diff main...HEAD --stat
git diff main...HEAD

# Get commit messages in range
git log main...HEAD --oneline

# Get changed files only
git diff main...HEAD --name-only
```

**Critical:** Establish the exact commit range before proceeding. All issues found in later steps must be traceable to lines within this range. This is what makes claims credible.

## Step 2: Gather the Raw Diff

```bash
# Full diff with context lines
git diff main...HEAD -U5

# Stats summary
git diff main...HEAD --stat

# Commit messages for intent signals
git log main...HEAD --format="%H %s%n%b"
```

Capture:
- Files changed (categorized by type: `.ts`, `.tsx`, `.md`, config, etc.)
- Total lines added/removed
- New files vs modifications vs deletions
- Key commit messages (often reveal intent)

## Step 3: Gather Intent Context

Attempt to gather in priority order:

1. **PR description** — If PR URL provided: `gh pr view [number] --json title,body,labels`
2. **Linked ticket** — Look for ticket references in commit messages (JIRA-123, #456, etc.)
3. **CLAUDE.md** — Check for project-level context about patterns and decisions
4. **Recent conversation** — Has the user explained what they're building in this session?
5. **Commit messages** — Extract stated reasons from `git log`

If none available: note "Intent context: not available — review will focus on technical correctness only"

## Step 4: Fingerprint the Changes

Analyze the diff to produce a **change fingerprint** — a structured summary of what kind of changes were made. This drives agent selection in DelegateAgents.

```
Change Fingerprint:
- Languages: [TypeScript, React/TSX, CSS, ...]
- Domains: [API endpoints, UI components, data models, config, tests, ...]
- Patterns: [New feature, refactor, bug fix, dependency update, ...]
- Risk areas: [Auth-related, DB queries, external API calls, user data, ...]
- Size tier: [Small / Medium / Large] based on line count
```

## Step 5: Produce Context Layer

Compress everything into a **slim, structured context layer** — designed to be injected into agent prompts without token waste. Target: under 500 tokens for small changes, under 1200 for large.

```markdown
## CodeReview Context Layer

**Commit range:** [SHA..SHA or branch..HEAD]
**Changed files:** [N files — list with type]
**Size:** [+X / -Y lines]

**Intent:**
[1-3 sentences: what this change is trying to accomplish, based on PR description / ticket / commits]

**Key changes summary:**
- [File/component]: [What changed in 1 line]
- [File/component]: [What changed in 1 line]
...

**Change fingerprint:**
- Languages: [list]
- Domains: [list]
- Risk areas: [list]
- Size tier: [Small / Medium / Large]

**Full diff:** [attached below or reference path]
```

Write this to: `_output/contexts/[context-slug]/notes/CodeReview-Context.md`

## Step 6: Confirm Before Proceeding

Output the context layer to the user and confirm:
- "Here is the context layer I've built. Does this accurately capture what you're reviewing? Anything missing from the intent section?"
- If user confirms → proceed to DelegateAgents
- If corrections needed → update context layer and confirm again

## Follow-Up

Always chains to → **DelegateAgents** (unless user says to stop)
