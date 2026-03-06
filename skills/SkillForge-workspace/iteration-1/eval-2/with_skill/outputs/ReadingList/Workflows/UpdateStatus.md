# UpdateStatus Workflow

> **Trigger:** "update reading status", "mark book finished", "mark book done", "rate book", "reading progress", "remove from reading list"

## Reference Material

- None.

## Purpose

Update the status, rating, or notes for an existing item on the reading list. Handles transitions between reading states and captures completion data.

## Workflow Steps

### Step 1: Parse the Request

Extract from the user's message:
- **Title** (or partial match — required)
- **New status** (to-read, reading, finished, dropped — if specified)
- **Rating** (1-5 — if specified)
- **Notes** (if specified)
- **Action** (update, remove — default: update)

### Step 2: Find the Entry

Read the reading list file at `$PAI_DIR/data/ReadingList.md`.

Search for the item by title. Use fuzzy matching — the user may not provide the exact title. If multiple matches are found, present the options and ask the user to clarify.

If the item is not found, inform the user and suggest they use AddBook to add it first.

### Step 3: Apply the Update

Based on the requested action:

**Status change:**
- Update the Status column to the new value
- If changing to "reading" and Date Added is the only date, no additional date needed
- If changing to "finished", set Date Finished to today's date (YYYY-MM-DD)
- If changing to "dropped", set Date Finished to today's date

**Rating:**
- Set the Rating column (1-5)
- Rating can only be set when status is "finished" or "dropped". If the item is still "to-read" or "reading", change status to "finished" first (confirm with user).

**Notes:**
- Append to existing notes (do not overwrite) separated by "; "

**Remove:**
- Delete the row from the table entirely
- Confirm before removing

### Step 4: Confirm

Report back to the user:
- What was changed
- Current state of the item (or confirmation of removal)
