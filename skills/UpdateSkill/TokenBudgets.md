# Token Budgets

Context file for **WorkflowDecompose** — defines token budget targets, sharding rules, and anti-patterns for skill optimization.

## Budget Targets

| File Type | Line Limit | Purpose |
|-----------|-----------|---------|
| `SKILL.md` | ≤ 100 lines | Routing + quick reference only — loads on EVERY invocation |
| Workflow files (`Workflows/*.md`) | ≤ 150 lines | One SOP per file — loads only when that workflow runs |
| Context files (skill root `*.md`) | ≤ 200 lines | Reference material — loads only when referenced by a workflow |

**Why these limits?** Claude Code loads SKILL.md on every skill invocation. Each extra line = tokens consumed before the user's actual task begins. Workflow and context files load conditionally, so their limits are more lenient but still matter for deep workflow chains.

## Sharding Decision Rules

**Move content OUT of SKILL.md when:**
- A section exceeds 30 lines (it's a reference document, not routing)
- Content is needed by only 1-2 workflows (not universal)
- It's a lookup table, checklist, or long example

**Move content OUT of a workflow file when:**
- Content is shared across 3+ workflows (create a context file instead; 2 workflows sharing = acceptable duplication)
- A single workflow exceeds 150 lines (split into phases or shard reference material)
- Examples are detailed enough to distract from the SOP steps

**Create a new workflow when:**
- A trigger phrase cluster doesn't map to any existing workflow
- An existing workflow is doing two conceptually distinct jobs
- Users consistently reach a workflow via the wrong trigger

**Merge workflows when:**
- A workflow is < 20 lines and could fold into SKILL.md Quick Reference
- Two workflows share the same trigger intent and differ only in minor details

## Anti-Patterns

| Anti-Pattern | Why It's Bad | Fix |
|-------------|-------------|-----|
| Context file referenced from SKILL.md | Loads on EVERY invocation, not just relevant ones | Reference only from specific workflows |
| Workflow file > 150 lines | Slow per-invocation cost, hard to maintain | Split into phases or extract reference material |
| SKILL.md > 100 lines | Max token cost on every invocation | Move reference sections to context files |
| Orphaned context file (no workflow references it) | Wasted file, loads if agent browses directory | Delete or integrate |
| Examples buried in workflow files | Hard to maintain, token waste when not needed | Move to SKILL.md `## Examples` or dedicated `Examples.md` |
| Single workflow doing 3+ distinct jobs | Confusing routing, hard to test | Split into focused workflows |

## Load Mechanics (How Files Actually Load)

```
Every invocation:
  SKILL.md loads automatically

Workflow invocation:
  Workflow/*.md loads (the matched one)
  + any context files listed in its ## Reference Material section

Context files:
  Load ONLY when referenced from a workflow's ## Reference Material
  NEVER auto-load from SKILL.md
```

**The `## Reference Material` section is the load manifest.** If a context file isn't listed in a workflow's Reference Material, it doesn't load for that workflow. WorkflowDecompose uses this section to infer per-invocation token costs.

## Orphan Detection

A context file is **orphaned** if it appears in zero workflow `## Reference Material` sections.

Orphaned files are candidates for:
1. Deletion (if the content is no longer relevant)
2. Integration into SKILL.md (if it's short and universal)
3. Reference Material addition in the appropriate workflow
