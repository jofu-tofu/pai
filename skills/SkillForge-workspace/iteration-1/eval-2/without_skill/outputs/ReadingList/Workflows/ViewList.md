# ViewList Workflow

> **Trigger:** "show reading list", "what am I reading", "currently reading", "reading list", "tbr list"

## Purpose

Display the reading list, filtered and formatted based on the user's request.

## Steps

### Step 1: Determine Filter

Parse what the user wants to see:

| Pattern | Filter |
|---------|--------|
| "currently reading", "what am I reading" | status = "reading" |
| "to-read", "tbr", "want to read", "backlog" | status = "to-read" |
| "finished", "completed", "read" | status = "finished" |
| "dropped", "abandoned" | status = "dropped" |
| "all", "everything", "full list" | no filter |
| "high priority", "important" | priority = "high" |
| specific tag like "sci-fi" | tags contains value |

Default (no qualifier): show "reading" first, then "to-read" items.

### Step 2: Read Data

Load `reading-list.json` from vault.

If file doesn't exist or is empty, report that the reading list is empty and suggest using AddItem.

### Step 3: Format Output

Format as a clear, readable table:

**Currently Reading:**
```
| # | Title                | Author          | Progress      | Started    |
|---|----------------------|-----------------|---------------|------------|
| 1 | Neuromancer          | William Gibson  | 142/271 (52%) | 2026-02-19 |
| 2 | Designing Data Apps  | Martin Kleppman | Ch 4/12       | 2026-03-01 |
```

**To-Read (TBR):**
```
| # | Title               | Author         | Priority | Added      |
|---|---------------------|----------------|----------|------------|
| 1 | Snow Crash          | Neal Stephenson| high     | 2026-01-15 |
| 2 | The Mythical Man    | Fred Brooks    | medium   | 2026-02-28 |
```

**Finished:**
```
| # | Title              | Author         | Rating | Finished   | Days |
|---|-------------------|----------------|--------|------------|------|
| 1 | Dune              | Frank Herbert  | 5/5    | 2026-01-20 | 21   |
```

### Step 4: Summary Stats

Include a summary at the bottom:
```
Reading: X | To-Read: X | Finished: X | Dropped: X | Total: X
```

If viewing finished books, include:
- Average rating
- Books finished this month/year
- Average reading time

## Example Output

```
READING LIST - Currently Reading (2 items)

| # | Title               | Author          | Progress      | Started    |
|---|---------------------|-----------------|---------------|------------|
| 1 | Neuromancer         | William Gibson  | 142/271 (52%) | 2026-02-19 |
| 2 | Designing Data Apps | Martin Kleppman | Ch 4/12 (33%) | 2026-03-01 |

Summary: 2 reading | 5 to-read | 8 finished | 1 dropped | 16 total
```
