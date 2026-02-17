# SearchSimilar Workflow

**Purpose:** Find DLGs with similar descriptions or in related functional areas to understand precedent and patterns.

**Triggers:** "find similar DLGs", "search related DLGs", "find precedent DLGs", "discover similar work"

---

## Overview

This workflow helps discover related development work by searching Track for DLGs with:
- Similar technical descriptions
- Common keywords and themes
- Related functional areas
- Precedent implementations

**Use Cases:**
- Find prior art before starting new work
- Discover patterns used in similar features
- Identify developers with expertise in area
- Review historical approaches to similar problems

---

## Step 1: Extract Search Terms

[TODO: Parse user input or derive keywords from current DLG]

**Option A: User Provides Keywords**
Input: "find similar DLGs to keyboard accessibility"
→ Search terms: "keyboard accessibility"

**Option B: Derive from Current DLG**
If user typed "find similar DLGs" without keywords:
1. Check conversation context for current DLG
2. Read DLG description from previous GatherContext output
3. Extract key nouns and technical terms
4. Use those as search terms

**Example Keyword Extraction:**
```
DLG description: "Implement keyboard shortcuts for navigation actions"
→ Search terms: "keyboard shortcuts navigation"
```

[TODO: Implement keyword extraction logic]

---

## Step 2: Search Track for Similar DLGs

[TODO: Call track_search_records with keywords]

**MCP Tool:**
```typescript
mcp__claude_ai_Epic_Knowledge_Wiki_Galaxy_EMC2_Hubble__track_search_records({
  query: "{SEARCH_TERMS}",
  record_type: "dlg",
  mode: "hybrid",
  limit: 10,
  statuses: ["Done"],  // Optionally filter to completed work
  applications: []     // Leave empty to search all applications
})
```

**Search Mode:** `hybrid` (combines keyword matching with semantic similarity)

**Why limit to Done status?** Completed DLGs provide proven precedent. In-progress work may change.

**User Override:** Allow user to specify "search all statuses" to include in-progress DLGs.

**Error Handling:**
- If zero results → Display "No similar DLGs found for '{SEARCH_TERMS}'"
- If Track API fails → Stop with error: "Track API unavailable"

---

## Step 3: Display Search Results

[TODO: Format and present matched DLGs]

**Format:**
```
═══════════════════════════════════════════════════════
SIMILAR DLGs: "{SEARCH_TERMS}"
═══════════════════════════════════════════════════════

Found {count} similar DLGs (Status: Done)

1. DLG-{id}: {name}
   Status: {status}
   Application: {application}

   Matched context:
   "{matched_chunk_text}"

   URL: {_url}

2. DLG-{id}: {name}
   Status: {status}
   Application: {application}

   Matched context:
   "{matched_chunk_text}"

   URL: {_url}

...

═══════════════════════════════════════════════════════
Showing top {count} results. Refine search with more specific terms.
═══════════════════════════════════════════════════════
```

**Matched Context:**
The `track_search_records` response includes `matched_chunks` field for semantic/hybrid searches. This shows which part of the DLG description matched the query.

**Display:** Show the matched text snippet (truncate to 200 chars if needed) to help user understand relevance.

---

## Step 4: Filter and Refine Options

[TODO: Present filtering options to user]

**Format:**
```
REFINE SEARCH
═════════════

Narrow results by:
  "filter by status {status}"      → Show only DLGs with specific status
  "filter by application {app}"    → Show only DLGs for specific application
  "more results"                   → Increase limit from 10 to 25

Explore a specific DLG:
  "gather context for {id}"        → GatherContext for a similar DLG
  "compare DLG {id1} and {id2}"    → [Future enhancement - not in shell]
```

**Status Options:** Done, In Progress, New, Planned, Cancelled
**Application Examples:** Hyperspace, Chronicles, Beaker, Cogito

---

## Step 5: Present Next Steps

[TODO: Suggest follow-up actions based on results]

**Format:**
```
NEXT STEPS
══════════

Explore a similar DLG:
  "gather context for <ID>"        → Get full details for a specific DLG
  "find DLG commits for <ID>"      → See code changes from similar work

Refine search:
  "find similar DLGs to {new_keywords}"  → Try different search terms
  "filter by status Done"                → Show only completed DLGs

Compare patterns:
  "analyze commits for <ID>"       → Review implementation approach
```

---

## Advanced: Status and Application Filtering

[TODO: Implement secondary filtering on search results]

**Triggered by:** User typing "filter by status {status}" or "filter by application {app}"

**Implementation:**
- Re-call `track_search_records` with updated `statuses` or `applications` parameters
- Keep same query terms, just add filters
- Display results with filter applied

**Example:**
```
User: "find similar DLGs to keyboard navigation"
→ Shows 10 results across all statuses/applications

User: "filter by status Done"
→ Re-search with statuses: ["Done"], show filtered results

User: "filter by application Hyperspace"
→ Re-search with applications: ["Hyperspace"], show filtered results
```

---

## Error Cases and Recovery

| Situation | Action | Rationale |
|-----------|--------|-----------|
| No search terms provided | Ask user for keywords | Cannot search without terms (primary failure) |
| Zero results found | Display message, suggest broader terms | Valid state - truly no similar work |
| Track API down | Stop with error | Cannot search without API (primary failure) |
| Too many results (100+) | Show first 10, offer pagination | Manageable initial view (future: pagination) |
| Ambiguous keywords | Show all matches, offer refinement | Let user see results and decide |

---

## Example Output

```
═══════════════════════════════════════════════════════
SIMILAR DLGs: "keyboard navigation"
═══════════════════════════════════════════════════════

Found 8 similar DLGs (Status: Done)

1. DLG-2282544: Keyboard accessibility shortcuts for navigation
   Status: Done
   Application: Hyperspace

   Matched context:
   "Implement keyboard shortcuts to improve accessibility for
   navigation actions. Support Tab/Shift+Tab for focus movement..."

   URL: https://track.epic.com/Track/Wizard.asp?id=2282544

2. DLG-2280123: Navigation tree keyboard support
   Status: Done
   Application: Hyperspace

   Matched context:
   "Add keyboard navigation to tree components using arrow keys
   for expansion/collapse and Enter for selection..."

   URL: https://track.epic.com/Track/Wizard.asp?id=2280123

3. DLG-2275678: Keyboard shortcuts for chart navigation
   Status: Done
   Application: Hyperspace

   Matched context:
   "Implement arrow key navigation within patient charts, allowing
   keyboard-only users to move between sections..."

   URL: https://track.epic.com/Track/Wizard.asp?id=2275678

...

═══════════════════════════════════════════════════════
Showing top 8 results. Refine search with more specific terms.
═══════════════════════════════════════════════════════

REFINE SEARCH
═════════════

Narrow results:
  "filter by status Done"          → Already filtered to Done
  "filter by application Hyperspace" → Show only Hyperspace DLGs

Explore a specific DLG:
  "gather context for 2282544"     → Full details for first result

NEXT STEPS
══════════

  "gather context for <ID>"        → Get full DLG details
  "find DLG commits for <ID>"      → See code changes
  "traverse DLG links for <ID>"    → Explore linked records
```

---

## Use Case: Finding Precedent Before Starting Work

**Scenario:** Developer is assigned a new DLG to implement keyboard shortcuts for a dialog component.

**Workflow:**
```
1. User: "find similar DLGs to keyboard shortcuts dialog"
   → Shows 10 DLGs with similar work

2. User: "gather context for 2282544"
   → Displays full DLG details, linked designs, QA notes

3. User: "find DLG commits for 2282544"
   → Shows git commits with code changes

4. User: "show commit a1b2c3d"
   → Reviews implementation approach

Result: Developer understands proven patterns before starting new work
```

---

## Future Enhancements (Out of Scope for Shell)

- **Compare DLGs** - Side-by-side comparison of two similar DLGs
- **Pattern extraction** - Automatically identify common approaches across similar DLGs
- **Developer expertise** - Find developers who worked on similar DLGs
- **Code similarity** - Search codebase for files related to similar DLGs
- **Timeline view** - Show evolution of similar work over time

---

## Related Workflows

- **GatherContext** - Get full details for a specific DLG from search results
- **AnalyzeCommits** - Review code changes from similar work
- **TraverseRelationships** - Explore linked records for precedent understanding

---

## Context Documentation

- `TrackContext.md` - DLG structure, MCP tools, search modes
- `GitPatterns.md` - Git patterns (for analyzing commits from similar DLGs)
