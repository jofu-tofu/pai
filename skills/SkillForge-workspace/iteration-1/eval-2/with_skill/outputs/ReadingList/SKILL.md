---
name: ReadingList
description: Track and manage a personal reading list of books, articles, and papers. USE WHEN add book OR add to reading list OR track book OR what am I reading OR reading list OR update reading status OR mark book finished OR mark book done OR rate book OR view reading list OR show reading list OR book recommendations OR what should I read OR reading progress OR remove from reading list.
---

# ReadingList

Track and manage a personal reading list with status tracking, ratings, and notes.

> **For agents modifying this skill:** Read SkillIntent.md before making changes. Modify triggers, descriptions, and workflows through SkillForge.

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

| Workflow | Trigger | File |
|----------|---------|------|
| **AddBook** | "add book", "add to reading list", "track book", "new book to read" | `Workflows/AddBook.md` |
| **UpdateStatus** | "update reading status", "mark book finished", "mark book done", "rate book", "reading progress", "remove from reading list" | `Workflows/UpdateStatus.md` |
| **ViewList** | "view reading list", "show reading list", "what am I reading", "what should I read", "book recommendations" | `Workflows/ViewList.md` |

## Examples

**Example 1: Add a book**
```
User: "Add 'Project Hail Mary' by Andy Weir to my reading list"
-> Invokes AddBook workflow
-> Adds entry with title, author, date, status "to-read"
-> Confirms the addition with current list count
```

**Example 2: Update reading status**
```
User: "I finished reading Dune, give it 5 stars"
-> Invokes UpdateStatus workflow
-> Finds "Dune" in the list, updates status to "finished"
-> Sets rating to 5, prompts for optional notes
-> Confirms the update
```

**Example 3: View the reading list**
```
User: "Show me what I'm currently reading"
-> Invokes ViewList workflow
-> Filters list to items with status "reading"
-> Displays formatted table with title, author, date started
```
