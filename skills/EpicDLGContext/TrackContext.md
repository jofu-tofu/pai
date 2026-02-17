# Epic Track System Context

This document explains the Epic Track system structure, DLG (Development Log) fields, and how to use Track MCP tools to gather context.

---

## What is a DLG?

**DLG (Development Log)** is Epic's primary record type for tracking development work. Each DLG represents a unit of development work that can be:
- A bug fix
- A new feature
- An enhancement to existing functionality
- Technical debt cleanup
- Performance improvement

DLGs are the central record type that links to other Track records to form a comprehensive development context.

---

## Track Record Types

| Type | Name | Purpose | Links From DLG |
|------|------|---------|----------------|
| **DLG** | Development Log | Primary development work unit | N/A (is the starting point) |
| **XDS** | Design | Technical design documents | DLG → XDS (implementation follows design) |
| **ZQN** | QA Note | Bug reports and test results | DLG → ZQN (fixes bugs) |
| **PRJ** | Project | High-level project containers | DLG → PRJ (belongs to project) |
| **DRN** | Dev Release Note | Release documentation | DLG → DRN (included in release) |

---

## DLG Structure (Key Fields)

**Core Identification:**
- `id` - Numeric DLG ID (e.g., "2282544")
- `name` - Human-readable title (e.g., "Keyboard accessibility shortcuts")
- `status` - Current state (e.g., "Done", "In Progress", "New")

**Application Context:**
- `application` - Which Epic application/product (e.g., "Hyperspace", "Chronicles")

**Relationships (Links to Other Records):**
- `Designs` - Array of XDS IDs (technical designs this DLG implements)
- `QANotes` - Array of ZQN IDs (bugs this DLG fixes)
- `Projects` - Array of PRJ IDs (parent projects this DLG belongs to)
- `DevReleaseNotes` - Array of DRN IDs (release notes this DLG appears in)

**Additional Context:**
- `description` - Full text description of the work
- `developer` - Who worked on it
- `dateCompleted` - When it finished

---

## MCP Tools for Track Access

The skill uses two primary MCP tools provided by the `claude.ai Epic Knowledge [Wiki, Galaxy, EMC2, Hubble]` server:

### 1. `track_search_records` - Find DLGs by Keywords

**Use when:** You need to find DLGs by description, title, or related content.

**Parameters:**
```typescript
{
  query: string,              // Search terms
  record_type: "dlg",         // DLG, XDS, ZQN, PRJ, or DRN
  mode: "keyword" | "semantic" | "hybrid",  // Search mode
  limit: number,              // Max results (1-100)
  offset: number,             // Pagination offset
  statuses: string[],         // Filter by status (e.g., ["Done"])
  applications: string[]      // Filter by application
}
```

**Returns:**
- Array of matching records with: id, name, url, status, matched text snippets

**Example:**
```typescript
track_search_records({
  query: "keyboard accessibility",
  record_type: "dlg",
  mode: "hybrid",
  statuses: ["Done"],
  limit: 10
})
```

### 2. `track_get_records` - Fetch Full DLG Details

**Use when:** You have a DLG ID and need complete details.

**Parameters:**
```typescript
{
  record_type: "dlg",         // DLG, XDS, ZQN, PRJ, or DRN
  ids: string[],              // Array of record IDs
  detail: "summary" | "standard" | "full"  // Detail level
}
```

**Detail Levels:**
- `summary` - Core fields only (id, name, status, link counts)
- `standard` - Full JSON but large arrays truncated to counts
- `full` - Complete record, nothing truncated (use for comprehensive context)

**Returns:**
- Array of records with `_url` metadata for Track UI links

**Example:**
```typescript
track_get_records({
  record_type: "dlg",
  ids: ["2282544"],
  detail: "full"
})
```

---

## Relationship Model

DLGs form the center of a relationship graph:

```
         ┌─────────┐
         │   PRJ   │ (Projects - architectural containers)
         │ (Parent)│
         └────┬────┘
              │
         ┌────▼────┐
         │   DLG   │ (Development Log - the work)
         └────┬────┘
         ┌────┼────┐
    ┌────▼─┐ │ ┌──▼───┐
    │ XDS  │ │ │ ZQN  │ (Designs and QA Notes)
    │Design│ │ │ Bug  │
    └──────┘ │ └──────┘
         ┌───▼───┐
         │  DRN  │ (Release Notes)
         │Release│
         └───────┘
```

**Typical Flow:**
1. Start with PRJ (project defines scope)
2. Create XDS (design the solution)
3. Work on DLG (implement the design)
4. Link ZQN (fix bugs found during testing)
5. Document in DRN (include in release notes)

---

## Design Decision - Traversal Depth Limits

**Why relationship traversal is depth-limited:**

**Depth 1 default (XDS/ZQN/DRN):**
- Prevents expensive API cascades
- Each linked record could itself have dozens of links, creating exponential API calls
- A single DLG with 5 XDS links, each with 10 DLG links = 50 API calls minimum
- Unlimited depth could trigger 100+ API calls for a single DLG query

**Depth 2 for PRJ (Projects):**
- Projects are hierarchical containers that provide essential architectural context
- Going one level deeper for PRJ links is justified by their structural importance
- Projects often link to multiple DLGs that share context - worth fetching

**API cost tradeoff:**
- Depth limits keep response time under 5 seconds
- Trade: Some context is missed vs. making queries practical for interactive use
- Users can always manually drill deeper if needed

**Cycle prevention:**
- Track records can form cycles: DLG A → XDS → DLG B → XDS → DLG A
- Depth limits prevent infinite loops without needing visited-record tracking
- Shell phase doesn't implement cycle detection - depth is the safety mechanism

**Future enhancement:**
- User-configurable depth parameter
- Visited-record tracking to enable deeper traversal safely
- Caching to make repeated traversals cheap

---

## Authentication and Availability

**MCP Tool Authentication:**
- Handled by Claude Code's MCP configuration (not by this skill)
- Requires valid Epic Kerberos credentials
- If MCP tools are unavailable, workflows will fail gracefully with error messages

**Error Handling:**
- Track API unavailable → Stop with error
- DLG doesn't exist → Stop with error
- Linked record fetch fails (404, auth error) → Display message, continue with other records

---

## References

- **Track UI:** https://track.epic.com/
- **MCP Server:** `claude.ai Epic Knowledge [Wiki, Galaxy, EMC2, Hubble]`
- **Related Skills:** EpicDesign (uses Track PRJ records), EpicBrowser (can screenshot Track UI)
