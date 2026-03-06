# AddItem Workflow

> **Trigger:** "add book", "add to reading list", "want to read", "tbr"

## Purpose

Add a new book, article, or other reading material to the reading list.

## Steps

### Step 1: Extract Item Details

Parse from the user's request or ask for missing required fields:
- **Title** (required)
- **Author** (required for books; optional for articles)
- **Type** (infer from context; default: "book")

Optional fields to ask about or infer:
- **Priority** (default: "medium")
- **Tags** (infer from context)
- **Total pages/chapters** (if mentioned)
- **Source** (where they heard about it, a URL, etc.)

### Step 2: Check for Duplicates

Read `reading-list.json` and check if an item with the same title and author already exists.

If duplicate found:
- Inform user the item is already on their list
- Show its current status
- Ask if they want to update it instead

### Step 3: Generate Entry

Create the item object:
```json
{
  "id": "<generate-uuid>",
  "title": "<title>",
  "author": "<author>",
  "type": "<type>",
  "status": "to-read",
  "priority": "<priority>",
  "dateAdded": "<today>",
  "dateStarted": null,
  "dateFinished": null,
  "progress": {
    "current": 0,
    "total": "<total-if-known>",
    "unit": "page"
  },
  "rating": null,
  "tags": ["<inferred-tags>"],
  "notes": "",
  "source": "<source-if-provided>"
}
```

### Step 4: Write to File

1. Read the existing `reading-list.json` (create if it doesn't exist)
2. Append the new item to the `items` array
3. Write the updated JSON back

```
Path: C:\Users\fujos\Obsidian\ReadingList\reading-list.json
```

### Step 5: Confirm

Report:
- Title and author added
- Status set to "to-read"
- Priority level
- Total items now on reading list

## Example Output

```
ADDED: "Neuromancer" by William Gibson
Type: book | Priority: medium | Status: to-read
Tags: #sci-fi #cyberpunk
Reading list now has 12 items (3 reading, 7 to-read, 2 finished)
```
