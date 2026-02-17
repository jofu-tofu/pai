# TraverseRelationships Workflow

**Purpose:** Recursively fetch full details for all records linked from a DLG (designs, QA notes, projects, release notes).

**Triggers:** "traverse DLG links", "get full DLG context tree", "deep dive DLG", "fetch all linked records"

---

## Overview

This workflow performs recursive traversal of Track record relationships starting from a DLG. It fetches complete details for:
- **XDS (Designs)** - Technical designs the DLG implements
- **ZQN (QA Notes)** - Bugs the DLG fixes
- **PRJ (Projects)** - Parent projects the DLG belongs to
- **DRN (Release Notes)** - Releases the DLG appears in

**Depth Strategy:**
- **Depth 1 (default)** for XDS, ZQN, DRN - Immediate children only
- **Depth 2 for PRJ** - Projects often link to related DLGs worth fetching

**Why depth limits?** See `TrackContext.md` Design Decision section for API cost tradeoffs and cycle prevention rationale.

---

## Step 1: Get DLG with Full Details

[TODO: Retrieve base DLG record]

**MCP Tool:**
```typescript
mcp__claude_ai_Epic_Knowledge_Wiki_Galaxy_EMC2_Hubble__track_get_records({
  record_type: "dlg",
  ids: ["{DLG_NUMBER}"],
  detail: "full"
})
```

**Extract Linked Record IDs:**
- `Designs` array → XDS IDs
- `QANotes` array → ZQN IDs
- `Projects` array → PRJ IDs
- `DevReleaseNotes` array → DRN IDs

**Edge Case - No Linked Records:**
If all arrays are empty (zero linked records), display:
```
⚠️  DLG has no linked records to traverse.

This DLG exists but is not connected to any designs, QA notes, projects, or release notes.

Next: Type 'find DLG commits' to analyze git history instead.
```
Then STOP (traversal has nothing to traverse).

---

## Step 2: Fetch Linked XDS (Designs) [Depth 1]

[TODO: For each XDS ID in Designs array, call track_get_records]

**MCP Tool:**
```typescript
mcp__claude_ai_Epic_Knowledge_Wiki_Galaxy_EMC2_Hubble__track_get_records({
  record_type: "xds",
  ids: ["{XDS_ID_1}", "{XDS_ID_2}", ...],
  detail: "standard"
})
```

**Detail Level:** `standard` (full JSON but large arrays truncated to counts)

**Traversal Depth:** **1 only** - Do NOT fetch records linked from XDS. Stop here for designs.

**Error Handling:**
- If XDS fetch fails (404, auth error) → Display "Could not fetch XDS {ID}" and continue with other records
- Do NOT stop workflow - other record types may succeed

**Display Format:**
```
DESIGNS (XDS)
═════════════

XDS-{id}: {name}
Status: {status}
Description: {description}
URL: {_url}

[Repeat for each XDS]
```

---

## Step 3: Fetch Linked ZQN (QA Notes) [Depth 1]

[TODO: For each ZQN ID in QANotes array, call track_get_records]

**MCP Tool:**
```typescript
mcp__claude_ai_Epic_Knowledge_Wiki_Galaxy_EMC2_Hubble__track_get_records({
  record_type: "zqn",
  ids: ["{ZQN_ID_1}", "{ZQN_ID_2}", ...],
  detail: "standard"
})
```

**Traversal Depth:** **1 only** - Do NOT fetch records linked from ZQN.

**Display Format:**
```
QA NOTES (ZQN)
══════════════

ZQN-{id}: {name}
Status: {status}
Bug Description: {description}
Severity: {severity}
URL: {_url}

[Repeat for each ZQN]
```

---

## Step 4: Fetch Linked PRJ (Projects) [Depth 2]

[TODO: For each PRJ ID in Projects array, call track_get_records]

**MCP Tool:**
```typescript
mcp__claude_ai_Epic_Knowledge_Wiki_Galaxy_EMC2_Hubble__track_get_records({
  record_type: "prj",
  ids: ["{PRJ_ID_1}", "{PRJ_ID_2}", ...],
  detail: "full"
})
```

**Detail Level:** `full` (complete record - we go deeper for projects)

**Traversal Depth:** **2** - Fetch PRJ, then fetch records linked FROM each PRJ.

**Special Case - PRJ Depth:**
If the DLG has a PRJ link, traverse to depth 2:
1. Fetch PRJ details
2. Extract PRJ's linked DLGs (other DLGs in same project)
3. Fetch summary details for those related DLGs (detail="summary")

**Why depth 2 for PRJ?** Projects are hierarchical containers. Related DLGs in the same project share architectural context. Worth the extra API calls.

**Display Format:**
```
PROJECTS (PRJ)
══════════════

PRJ-{id}: {name}
Status: {status}
Description: {description}
URL: {_url}

Related DLGs in this project:
  - DLG-{id}: {name} ({status})
  - DLG-{id}: {name} ({status})

[Repeat for each PRJ]
```

---

## Step 5: Fetch Linked DRN (Release Notes) [Depth 1]

[TODO: For each DRN ID in DevReleaseNotes array, call track_get_records]

**MCP Tool:**
```typescript
mcp__claude_ai_Epic_Knowledge_Wiki_Galaxy_EMC2_Hubble__track_get_records({
  record_type: "drn",
  ids: ["{DRN_ID_1}", "{DRN_ID_2}", ...],
  detail: "standard"
})
```

**Traversal Depth:** **1 only** - Do NOT fetch records linked from DRN.

**Display Format:**
```
RELEASE NOTES (DRN)
═══════════════════

DRN-{id}: {name}
Release Date: {releaseDate}
Summary: {summary}
URL: {_url}

[Repeat for each DRN]
```

---

## Step 6: Display Relationship Hierarchy

[TODO: Show tree view of all relationships]

**Format:**
```
═══════════════════════════════════════════════════════
RELATIONSHIP TREE for dlg-{NUMBER}
═══════════════════════════════════════════════════════

DLG-{NUMBER}: {name}
│
├─ XDS (Designs): {count}
│  ├─ XDS-{id}: {name}
│  └─ XDS-{id}: {name}
│
├─ ZQN (QA Notes): {count}
│  ├─ ZQN-{id}: {name}
│  └─ ZQN-{id}: {name}
│
├─ PRJ (Projects): {count}
│  └─ PRJ-{id}: {name}
│     ├─ DLG-{id}: {name} (related DLG in project)
│     └─ DLG-{id}: {name} (related DLG in project)
│
└─ DRN (Release Notes): {count}
   └─ DRN-{id}: {name}

═══════════════════════════════════════════════════════
Total Records Fetched: {total_count}
API Calls Made: {api_call_count}
═══════════════════════════════════════════════════════
```

---

## Edge Cases and Limitations

### Cycles in Record Relationships

**Problem:** Track records can form cycles:
```
DLG A → XDS → DLG B → XDS → DLG A (infinite loop)
```

**Solution:** Depth limits prevent cycles without needing visited-record tracking.
- Depth 1 for XDS/ZQN/DRN means we never follow links FROM those records
- Depth 2 for PRJ is safe because we only fetch DLG summaries, not their links

**Future Enhancement:** Implement visited-record set to detect cycles and enable configurable depth.

### Large Graphs

**Problem:** A DLG with 20+ linked records creates many API calls.

**Shell Phase Behavior:** Display all records found. No pagination or limits.

**Warning Display:**
```
⚠️  This DLG has {count} linked records.
Fetching all details may take 10-15 seconds...
```

**Future Enhancement:** Add pagination, lazy loading, or user-configurable limits.

### API Failures

**Problem:** Individual record fetches can fail (404, auth error, timeout).

**Handling:**
- Display error message for failed record: "Could not fetch {type} {id}: {error}"
- Continue with other records - don't stop workflow
- Show partial results with gaps acknowledged

---

## Error Cases and Recovery

| Situation | Action | Rationale |
|-----------|--------|-----------|
| DLG doesn't exist | Stop with error | Cannot traverse non-existent record (primary failure) |
| DLG has no linked records | Display message, stop | Nothing to traverse (primary goal unmet) |
| Individual record fetch fails | Display error, continue | Partial results better than none (secondary failure) |
| Track API down | Stop with error | Cannot retrieve any data (primary failure) |
| Cycle detected | N/A (prevented by depth limits) | Depth limits are the cycle prevention mechanism |
| Too many records (50+) | Display all (may be slow) | No timeout in shell phase - show warning |

---

## Example Output

```
═══════════════════════════════════════════════════════
RELATIONSHIP TREE for dlg-2282544
═══════════════════════════════════════════════════════

DLG-2282544: Keyboard accessibility shortcuts for navigation
│
├─ XDS (Designs): 2
│  ├─ XDS-151604: Keyboard Navigation Framework
│  │  Status: Done
│  │  Description: Framework for managing keyboard focus...
│  └─ XDS-151605: Focus Management Design
│     Status: Done
│     Description: Design for focus trap prevention...
│
├─ ZQN (QA Notes): 1
│  └─ ZQN-789012: Focus trap in modal dialogs
│     Status: Resolved
│     Severity: Medium
│     Description: Users cannot escape modal with keyboard...
│
├─ PRJ (Projects): 1
│  └─ PRJ-54321: Accessibility Improvements 2024
│     Status: Active
│     Description: Project to improve WCAG compliance...
│     Related DLGs in this project:
│       - DLG-2282540: Screen reader support (Done)
│       - DLG-2282544: Keyboard shortcuts (Done) [THIS DLG]
│       - DLG-2282549: Color contrast fixes (In Progress)
│
└─ DRN (Release Notes): 1
   └─ DRN-2024-01: January 2024 Release
      Release Date: 2024-01-31
      Summary: Accessibility and keyboard navigation improvements...

═══════════════════════════════════════════════════════
Total Records Fetched: 8 (1 DLG + 2 XDS + 1 ZQN + 1 PRJ + 3 related DLGs + 1 DRN)
API Calls Made: 5
═══════════════════════════════════════════════════════

NEXT STEPS
══════════

  "find DLG commits"           → AnalyzeCommits workflow
  "gather context for {ID}"    → GatherContext for a related DLG
  "find similar DLGs"          → SearchSimilar workflow
```

---

## Related Workflows

- **GatherContext** - Initial DLG lookup (provides DLG number to this workflow)
- **AnalyzeCommits** - Git history for code changes
- **SearchSimilar** - Find DLGs with similar descriptions

---

## Context Documentation

- `TrackContext.md` - Record types, relationship model, depth limits rationale
- `GitPatterns.md` - Git patterns (not used by this workflow but available for context)
