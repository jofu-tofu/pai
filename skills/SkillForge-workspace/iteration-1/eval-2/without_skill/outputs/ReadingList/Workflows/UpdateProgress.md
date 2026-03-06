# UpdateProgress Workflow

> **Trigger:** "started reading", "finished reading", "update progress", "on page", "reading progress"

## Purpose

Update the reading status or progress of an item on the reading list.

## Steps

### Step 1: Identify the Item

Parse the item title from the user's request. If ambiguous:
- Search `reading-list.json` for partial title matches
- If multiple matches, present options and ask user to clarify

### Step 2: Determine Update Type

Infer update type from the request:

| Pattern | Action |
|---------|--------|
| "started", "beginning", "picked up" | Set status to "reading", set dateStarted |
| "on page X", "chapter X", "X%" | Update progress.current |
| "finished", "done", "completed" | Set status to "finished", set dateFinished |
| "dropped", "giving up", "won't finish" | Set status to "dropped" |
| "X out of 5", "rate it X", "X stars" | Set rating |

### Step 3: Apply Updates

Read `reading-list.json`, find the matching item, and apply changes:

**Starting a book:**
```json
{
  "status": "reading",
  "dateStarted": "<today>"
}
```

**Progress update:**
```json
{
  "progress": {
    "current": "<new-value>",
    "total": "<existing-or-new>",
    "unit": "<existing-or-inferred>"
  }
}
```

**Finishing a book:**
```json
{
  "status": "finished",
  "dateFinished": "<today>",
  "progress": { "current": "<total>", "total": "<total>", "unit": "<unit>" },
  "rating": "<if-provided>"
}
```

**Dropping a book:**
```json
{
  "status": "dropped",
  "dateFinished": "<today>"
}
```

### Step 4: Write Updated Data

Write the modified list back to `reading-list.json`.

### Step 5: Confirm

Report:
- Item title
- What changed
- Current progress (if applicable)
- Ask for rating if finishing and none provided

## Example Output

```
UPDATED: "Neuromancer" by William Gibson
Status: reading -> finished
Progress: 271/271 pages (100%)
Rating: 4/5
Finished in 14 days (started 2026-02-19)
```
