# GatherContext Workflow

**Purpose:** Search for a DLG by number or description, retrieve full details, and display linked related records.

**Triggers:** "gather DLG context", "get DLG details", "show DLG info", "look up DLG"

---

## Overview

This is the primary entry point for DLG context gathering. It provides a comprehensive view of a single DLG including:
- Core DLG details (description, status, application)
- Linked designs (XDS) - what technical designs this implements
- Linked QA notes (ZQN) - what bugs this fixes
- Linked projects (PRJ) - what high-level project this belongs to
- Linked release notes (DRN) - what releases this appears in

After displaying the context, it suggests next steps for deeper exploration using other workflows.

---

## Step 1: Extract DLG Number or Search Terms

[TODO: Parse user input to determine if they provided a DLG number or description keywords]

**If DLG number provided:**
- Extract numeric ID from patterns like: "dlg-2282544", "2282544", "DLG 2282544"
- Proceed to Step 2 with direct lookup

**If description/keywords provided:**
- Extract search terms like: "keyboard accessibility", "login bug", "performance improvement"
- Proceed to Step 2 with search mode

---

## Step 2: Retrieve DLG

### Option A: Direct Lookup (DLG number known)

[TODO: Call track_get_records with detail="full"]

**MCP Tool:**
```typescript
mcp__claude_ai_Epic_Knowledge_Wiki_Galaxy_EMC2_Hubble__track_get_records({
  record_type: "dlg",
  ids: ["{DLG_NUMBER}"],
  detail: "full"
})
```

**Error Handling:**
- If DLG doesn't exist (empty array returned) → Stop with error: "DLG {NUMBER} not found in Track"
- If Track API fails → Stop with error: "Track API unavailable"

### Option B: Search (keywords provided)

[TODO: Call track_search_records to find matching DLGs]

**MCP Tool:**
```typescript
mcp__claude_ai_Epic_Knowledge_Wiki_Galaxy_EMC2_Hubble__track_search_records({
  query: "{SEARCH_TERMS}",
  record_type: "dlg",
  mode: "hybrid",
  limit: 10
})
```

**After search results:**
- If zero results → Stop with message: "No DLGs found matching '{SEARCH_TERMS}'"
- If 1 result → Use that DLG, proceed to Step 3
- If 2-10 results → Present list, ask user to select one
  - Show: DLG ID, name, status, matched text snippet
  - Format: Numbered list for easy selection
  - After user selects → Call track_get_records for chosen DLG with detail="full"

---

## Step 3: Display DLG Core Details

[TODO: Format and display the main DLG information]

**Format:**
```
═══════════════════════════════════════════════════════
DLG CONTEXT: dlg-{NUMBER}
═══════════════════════════════════════════════════════

Title: {name}
Status: {status}
Application: {application}

Description:
{description}

Developer: {developer}
Completed: {dateCompleted}

Track URL: {_url}
═══════════════════════════════════════════════════════
```

---

## Step 4: Display Linked Records

[TODO: Show all linked XDS, ZQN, PRJ, DRN records]

**Edge Case - No Linked Records:**
If the DLG has zero linked records (empty arrays for Designs, QANotes, Projects, DevReleaseNotes), display:
```
⚠️  No linked records found for this DLG.
This DLG exists in Track but has no associated designs, QA notes, projects, or release notes.
```
Then STOP (since showing linked records IS the primary goal of GatherContext).

**Format:**
```
LINKED RECORDS
══════════════

Designs (XDS): {count}
{for each XDS ID}
  - XDS-{id}: {name} ({status})
    URL: {url}

QA Notes (ZQN): {count}
{for each ZQN ID}
  - ZQN-{id}: {name} ({status})
    URL: {url}

Projects (PRJ): {count}
{for each PRJ ID}
  - PRJ-{id}: {name} ({status})
    URL: {url}

Release Notes (DRN): {count}
{for each DRN ID}
  - DRN-{id}: {name}
    URL: {url}

══════════════════════════════════════════════════════
```

---

## Step 5: Present Next Steps

[TODO: Suggest follow-up workflows based on available context]

**Format:**
```
NEXT STEPS
══════════

Type one of the following to explore deeper:

  "find DLG commits"           → AnalyzeCommits workflow
                                  Search git history for code changes

  "traverse DLG links"         → TraverseRelationships workflow
                                  Fetch full details of all linked records

  "find similar DLGs"          → SearchSimilar workflow
                                  Discover related DLGs by keywords

  "gather context for <ID>"    → GatherContext for a different DLG
                                  Start over with a new DLG number
```

**DLG Number Passing:**
The DLG number (dlg-{NUMBER}) is now in conversation context. When user types one of the above commands, that workflow will read the DLG number from conversation history.

---

## Error Cases and Recovery

| Situation | Action | Rationale |
|-----------|--------|-----------|
| DLG doesn't exist | Stop with error | Cannot gather context for non-existent record (primary failure) |
| Track API down | Stop with error | Cannot retrieve any data (primary failure) |
| Invalid DLG format | Stop with error | User input cannot be parsed (primary failure) |
| No linked records | Display message, stop | This IS the primary goal - if no links exist, workflow is complete but result is empty |
| Git repo not available | Skip git analysis | Git is optional context - mention it's unavailable but show Track data |
| Search returns 0 results | Stop with message | Cannot continue without a DLG to display |
| Search returns 10+ results | Show first 10, allow selection | Pagination not implemented in shell phase |

---

## Example Output

```
═══════════════════════════════════════════════════════
DLG CONTEXT: dlg-2282544
═══════════════════════════════════════════════════════

Title: Keyboard accessibility shortcuts for navigation
Status: Done
Application: Hyperspace

Description:
Implement keyboard shortcuts to improve accessibility for
navigation actions. Support Tab/Shift+Tab for focus movement,
Enter/Space for activation, and Escape for dismissal.

Developer: John Smith
Completed: 2024-01-20

Track URL: https://track.epic.com/Track/Wizard.asp?id=2282544
═══════════════════════════════════════════════════════

LINKED RECORDS
══════════════

Designs (XDS): 2
  - XDS-151604: Keyboard Navigation Framework (Done)
    URL: https://track.epic.com/Track/Wizard.asp?xds=151604
  - XDS-151605: Focus Management Design (Done)
    URL: https://track.epic.com/Track/Wizard.asp?xds=151605

QA Notes (ZQN): 1
  - ZQN-789012: Focus trap in modal dialogs (Resolved)
    URL: https://track.epic.com/Track/Wizard.asp?zqn=789012

Projects (PRJ): 1
  - PRJ-54321: Accessibility Improvements 2024 (Active)
    URL: https://track.epic.com/Track/Wizard.asp?prj=54321

Release Notes (DRN): 1
  - DRN-2024-01: January 2024 Release
    URL: https://track.epic.com/Track/Wizard.asp?drn=2024-01

══════════════════════════════════════════════════════

NEXT STEPS
══════════

Type one of the following to explore deeper:

  "find DLG commits"           → AnalyzeCommits workflow
  "traverse DLG links"         → TraverseRelationships workflow
  "find similar DLGs"          → SearchSimilar workflow
```

---

## Related Workflows

- **AnalyzeCommits** - Find git commits for this DLG
- **TraverseRelationships** - Fetch full details of all linked records recursively
- **SearchSimilar** - Find DLGs with similar descriptions

---

## Context Documentation

- `TrackContext.md` - DLG structure, MCP tools, relationship model
- `GitPatterns.md` - Git commit patterns (used by AnalyzeCommits)
