---
name: EpicDLGContext
description: Gathers comprehensive context from Epic DLGs (Development Logs) including linked designs, QA notes, code changes, and historical background. USE WHEN gathering DLG context, analyzing development log, researching DLG history, investigating Track records, finding commits by DLG number, OR understanding DLG relationships.
---

# EpicDLGContext

Programmatically gather comprehensive context for Epic DLGs (Development Logs) to support PQAers, developers, and designers. This skill automates what would otherwise be manual Track UI navigation, git log searching, and record relationship traversal.

**What you get:**
- Full DLG details (description, status, application, linked records)
- Git commit history for code changes
- Related designs (XDS), QA notes (ZQN), projects (PRJ), release notes (DRN)
- Similar DLGs for historical context and precedent analysis

**Philosophy:** Do things programmatically where possible. Use MCP tools for Track access, git commands for commit history, and structured workflows to make context gathering repeatable and comprehensive.

---

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **GatherContext** | "gather DLG context", "get DLG details", "show DLG info" | `Workflows/GatherContext.md` |
| **AnalyzeCommits** | "find DLG commits", "show git history for DLG", "what changed in DLG" | `Workflows/AnalyzeCommits.md` |
| **TraverseRelationships** | "traverse DLG links", "get full DLG context tree", "deep dive DLG" | `Workflows/TraverseRelationships.md` |
| **SearchSimilar** | "find similar DLGs", "search related DLGs", "find precedent DLGs" | `Workflows/SearchSimilar.md` |

---

## Error Handling Conventions

This skill follows these patterns for edge cases:

**Stop on primary failure** (when the main workflow goal cannot be achieved):
- DLG doesn't exist in Track → Stop with error message
- Track API unavailable → Stop with error message
- Invalid DLG number format → Stop with error message

**Continue on secondary failure** (when optional enrichment context is missing):
- No git commits found → Display "No git commits found for this DLG" and continue
- No linked records (empty XDS/ZQN/PRJ) → Display "No linked records found" and stop (since this IS the primary goal of GatherContext)
- Git repo not found → Display message and skip git analysis

**Graceful degradation:** Workflows show whatever data is available, acknowledge gaps, and suggest next steps.

---

## Development Philosophy

This skill follows a **shell-first, implement-iteratively** approach:

1. **Workflow .md files contain:** Human-readable instructions and bash/MCP command examples that Claude Code agents interpret and execute. They are NOT executable code—they are step-by-step guides for AI agents.

2. **TODO markers** indicate validated workflow steps ready for implementation (not speculative features).

3. **Programmatic where possible:** Prefer MCP tool calls and git commands over manual instructions.

4. **When executing a TODO-marked workflow:**
   - AI agent reads the workflow .md file
   - If logic is clear from context docs → Agent implements by calling tools (MCP, bash, etc.)
   - If ambiguous → Agent asks user for clarification
   - After implementation → Replace TODO with concrete bash/MCP examples in the .md file

5. **Workflow composition:** Workflows can invoke each other by name (user types workflow trigger phrase).

6. **Inter-workflow state:** DLG number is passed via conversation context, not programmatic state.
   - When GatherContext displays "Type 'find DLG commits'", the DLG number stays in conversation memory
   - AnalyzeCommits workflow reads "find DLG commits for dlg-2282544" from conversation history
   - This is a limitation of the shell phase—future enhancement could use shared state files

**Example workflow transition:**
```
GatherContext displays:
  "DLG-2282544: Keyboard accessibility shortcuts
   Next steps: Type 'find DLG commits' to analyze git history,
   or 'traverse DLG links' to explore linked records."

User types: "find DLG commits"
→ AnalyzeCommits workflow activates with DLG-2282544 from conversation context
```

**Why conversation context?** In PAI's architecture, workflows are stateless markdown files interpreted by AI agents. The conversation serves as the "shared memory" between workflow invocations. This keeps workflows simple and composable without needing state management code.

---

## Examples

### Basic DLG Lookup
```
User: "gather DLG context for dlg-2282544"
→ Shows full DLG details, linked XDS/ZQN/PRJ, suggests next steps
```

### Git History Analysis
```
User: "find DLG commits for dlg-2282544"
→ Searches git log, shows all commits with that DLG number, offers diffs
```

### Deep Context Traversal
```
User: "traverse DLG links for dlg-2282544"
→ Fetches DLG, follows all XDS/ZQN/PRJ/DRN links recursively, displays hierarchy
```

### Finding Related Work
```
User: "find similar DLGs to keyboard accessibility"
→ Searches Track for related DLGs, shows top 10 with descriptions
```

---

## Context Documentation

- **`TrackContext.md`** - Epic Track system structure, DLG fields, MCP tools, relationship model
- **`GitPatterns.md`** - Git commit patterns for DLG extraction, search commands

---

## Future Enhancements

These can be added iteratively after the shell is proven useful:

1. **TypeScript CLI Tools** - `getDLG.ts`, `searchDLG.ts`, `analyzeDLG.ts` for programmatic access
2. **Prompting Integration** - Templates for DLG context assembly and formatting
3. **Browser Integration** - Use EpicBrowser to screenshot Track UI for visual context
4. **Caching** - Cache Track API responses to avoid repeated lookups
5. **Context Export** - Export gathered context as markdown/JSON for sharing
6. **PQA-Specific Views** - Curated views for QA testing scenarios
7. **Design Integration** - Add to EpicDesign skill as a workflow composition
