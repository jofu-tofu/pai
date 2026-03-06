# RemoveItem Workflow

> **Trigger:** "remove from reading list", "drop book", "won't read"

## Purpose

Remove an item from the reading list entirely, or mark it as dropped.

## Steps

### Step 1: Identify the Item

Parse the item title from the user's request. If ambiguous:
- Search `reading-list.json` for partial title matches
- If multiple matches, present options and ask user to clarify

### Step 2: Determine Action

Two possible actions:
- **Drop**: Set status to "dropped" (preserves the record)
- **Remove**: Delete the entry entirely from `reading-list.json`

If the user says "drop" or "giving up", use Drop.
If the user says "remove", "delete", or "take off list", use Remove.

If unclear, default to Drop (non-destructive).

### Step 3: Confirm Intent

Show the item details and confirm:
```
Found: "Neuromancer" by William Gibson
Status: to-read | Added: 2026-02-15

Action: Remove from list entirely? (or drop to keep record?)
```

For this skill, assume the user approves.

### Step 4: Apply Changes

**Drop:**
```json
{
  "status": "dropped",
  "dateFinished": "<today>"
}
```

**Remove:**
- Delete the item from the `items` array
- Optionally remove associated note file if it exists

### Step 5: Write Updated Data

Write the modified list back to `reading-list.json`.

### Step 6: Confirm

Report:
- Item that was dropped/removed
- Updated list count

## Example Output

```
REMOVED: "Neuromancer" by William Gibson
Previously: to-read (added 2026-02-15)
Reading list now has 11 items
```
