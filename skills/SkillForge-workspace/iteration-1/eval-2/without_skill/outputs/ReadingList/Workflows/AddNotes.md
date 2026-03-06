# AddNotes Workflow

> **Trigger:** "book notes", "reading notes", "thoughts on book", "review book"

## Purpose

Create or update reading notes for an item on the reading list. Notes are stored as individual markdown files in the Obsidian vault.

## Steps

### Step 1: Identify the Item

Parse the item title from the user's request. If ambiguous:
- Search `reading-list.json` for partial title matches
- If multiple matches, present options and ask user to clarify

### Step 2: Determine Note Content

Collect notes from the user. These can include:
- General thoughts and impressions
- Key quotes or passages
- Themes and takeaways
- Questions raised
- Connections to other books or ideas
- Chapter-specific notes

### Step 3: Generate Filename

Create a slug from title and author:
```
"Neuromancer" by William Gibson -> neuromancer-william-gibson.md
"The Art of War" by Sun Tzu -> the-art-of-war-sun-tzu.md
```

### Step 4: Write Note File

Create or update the note at:
```
C:\Users\fujos\Obsidian\ReadingList\Notes\<slug>.md
```

Note format:
```markdown
---
title: "<Book Title>"
author: "<Author>"
type: <type>
status: <current-status>
rating: <rating-or-null>
dateStarted: <date>
dateFinished: <date-or-null>
tags:
  - reading-notes
  - <additional-tags>
---

# <Book Title>
**By <Author>**

## Key Takeaways
- <takeaway-1>
- <takeaway-2>

## Notes
<user's notes here>

## Quotes
> <any quotes the user mentioned>

## Connections
- [[<Related concepts or books>]]
```

If the file already exists, append new notes under the existing content with a dated section:
```markdown
## Notes - 2026-03-05
<new notes>
```

### Step 5: Update Reading List Entry

Update the item's `notes` field in `reading-list.json` to reference the note file path.

### Step 6: Confirm

Report:
- Note file path
- Sections created/updated
- Suggested wiki links for Obsidian

## Example Output

```
NOTES SAVED: ReadingList/Notes/neuromancer-william-gibson.md
Sections: Key Takeaways, Notes, Quotes
Links suggested: [[Cyberpunk]], [[AI in Fiction]], [[Snow Crash]]
```
