---
name: ReadingList
description: Track books, articles, and other reading material. USE WHEN reading list, book list, add book, track reading, what should I read, reading progress, book recommendation, finish book, start reading, reading log, tbr, to-read, currently reading, book notes.
---

# ReadingList

Personal reading list tracker. Add items, update progress, review what you're reading, and keep notes on finished material.

## Data Location

```
Path: C:\Users\fujos\Obsidian\ReadingList\
```

Reading list data is stored as a single JSON file and individual book-note markdown files:

```
ReadingList/
  reading-list.json        # Master list of all items
  Notes/                   # Per-item reading notes (markdown)
```

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **AddItem** | "add book", "add to reading list", "want to read", "tbr" | `Workflows/AddItem.md` |
| **UpdateProgress** | "started reading", "finished reading", "update progress", "on page", "reading progress" | `Workflows/UpdateProgress.md` |
| **ViewList** | "show reading list", "what am I reading", "currently reading", "reading list", "tbr list" | `Workflows/ViewList.md` |
| **AddNotes** | "book notes", "reading notes", "thoughts on book", "review book" | `Workflows/AddNotes.md` |
| **RemoveItem** | "remove from reading list", "drop book", "won't read" | `Workflows/RemoveItem.md` |

## Data Schema

Each reading list item in `reading-list.json` follows this structure:

```json
{
  "items": [
    {
      "id": "uuid-string",
      "title": "Book Title",
      "author": "Author Name",
      "type": "book | article | paper | essay | manga | comic | other",
      "status": "to-read | reading | finished | dropped",
      "priority": "high | medium | low",
      "dateAdded": "2026-03-05",
      "dateStarted": null,
      "dateFinished": null,
      "progress": {
        "current": 0,
        "total": null,
        "unit": "page | chapter | percent"
      },
      "rating": null,
      "tags": [],
      "notes": "",
      "source": ""
    }
  ]
}
```

## Examples

**Example 1: Add a book**
```
User: "Add Neuromancer by William Gibson to my reading list"
-> Invokes AddItem workflow
-> Creates entry with status "to-read"
-> Returns: confirmation with item details
```

**Example 2: Update reading progress**
```
User: "I'm on page 142 of Neuromancer"
-> Invokes UpdateProgress workflow
-> Updates progress.current to 142
-> If not already "reading", sets status to "reading" and dateStarted
-> Returns: progress update confirmation
```

**Example 3: View reading list**
```
User: "What am I currently reading?"
-> Invokes ViewList workflow
-> Filters items by status "reading"
-> Returns: formatted table of current reads with progress
```

**Example 4: Finish a book**
```
User: "I finished Neuromancer, 4 out of 5"
-> Invokes UpdateProgress workflow
-> Sets status to "finished", dateFinished, rating to 4
-> Returns: completion summary
```

**Example 5: Add reading notes**
```
User: "Save my notes on Neuromancer"
-> Invokes AddNotes workflow
-> Creates/updates Notes/neuromancer-william-gibson.md
-> Returns: file path, note summary
```

## Quick Reference

```
STORAGE:    C:\Users\fujos\Obsidian\ReadingList\reading-list.json
NOTES:      C:\Users\fujos\Obsidian\ReadingList\Notes\

STATUSES:   to-read | reading | finished | dropped
TYPES:      book | article | paper | essay | manga | comic | other
PRIORITIES: high | medium | low
RATINGS:    1-5 (null until rated)
```
