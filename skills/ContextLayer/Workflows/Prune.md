# Prune Workflow

Content-quality pass across all CLAUDE.md files in the project tree.
**No filesystem reads beyond the CLAUDE.md files themselves.**
Removes redundant, obvious, verbose, or low-signal content. Does NOT check accuracy (that's Audit).

---

## When to Use

- CLAUDE.md files have grown from appending and never removing
- User says "prune the context layer", "slim down CLAUDE.md", "shrink context"
- After a Generate or Audit run that added more than it removed
- Token budget is being exceeded

**Prune vs. Audit:** Prune asks "Is this content necessary?" — content-only, no filesystem reads.
Audit asks "Is this content accurate?" — reads referenced files to verify claims.
Run Prune first (cheap), then Audit if stale references are suspected.

---

## Workflow Steps

### Step 1 — Find All CLAUDE.md Files

Find all CLAUDE.md files in the project tree.
**Do not read any other files.** Prune operates on CLAUDE.md content only.

### Step 2 — Apply Falsifiability Test to Every Entry

For each CLAUDE.md file, examine each entry individually:

**Primary falsifiability test:**
> "If I removed this line, would an agent working in this project behave differently?"

**Secondary test (for infrequent-but-critical conventions):**
> "Even if an agent usually gets this right, would removing this cause wrong behavior 10% of the time in this specific project?"

If the answer to BOTH is NO → mark for removal.

### Step 3 — Apply Redundancy and Quality Checks

Mark for removal any entry that:

| Pattern | Example | Reason |
|---------|---------|--------|
| General programming knowledge | "Use meaningful variable names" | Agent already knows this |
| General best practices | "Don't commit secrets to git" | Not project-specific |
| Prose paragraphs | Any multi-sentence explanatory block | Converts to bullet or removes |
| "See also" references | "See: docs/architecture.md" | Agent won't follow them |
| Duplicate instructions | Same convention stated twice | Keep most specific version |
| Outdated version numbers | "React 17" when it's clearly 18+ | High rot risk, agent infers from code |
| Empty sections | Section headers with no content | Remove the header too |
| "This project uses X" statements | "This project uses TypeScript" | Agent infers from .ts files |

**Keep even if they feel obvious:**
- Project-specific commands (even if seemingly standard)
- File naming patterns that differ from language defaults
- Import alias configurations
- Hard constraints and prohibitions specific to this codebase

### Step 4 — Check Token Budget

After identifying removals, estimate remaining token count per file.
If still over budget (root >1500 tokens, subdir >500 tokens):
- Remove least-specific conventions (keep most specific ones)
- Convert any remaining prose to bullet points
- Remove file structure section if file tree is shallow and obvious

### Step 5 — Auto-Apply All Changes

Write pruned CLAUDE.md files across the full tree.
**Auto-apply — no confirmation required.** Changes are reversible via git.

Report on completion:
```
ContextLayer Prune complete:
  Files processed: N
  Files modified: M
  Lines removed: X
  ~Token reduction: Y tokens across all files
```

If zero changes: "CLAUDE.md files are already lean — no content to prune."

---

## What Prune Does NOT Do

- Does NOT read any project source files
- Does NOT check if file paths in CLAUDE.md still exist (that's Audit)
- Does NOT verify if commands still work (that's Audit)
- Does NOT add new content (that's Generate or Audit)
- Does NOT remove content just because it seems stale — only content that fails falsifiability

**If you need to verify accuracy of claims → use Audit instead.**
