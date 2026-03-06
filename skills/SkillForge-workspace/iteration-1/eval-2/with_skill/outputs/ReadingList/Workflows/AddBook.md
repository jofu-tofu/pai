# AddBook Workflow

> **Trigger:** "add book", "add to reading list", "track book", "new book to read"

## Reference Material

- None.

## Purpose

Add a new book, article, or paper to the user's personal reading list. Captures essential metadata and stores it in a structured markdown file.

## Workflow Steps

### Step 1: Parse the Request

Extract from the user's message:
- **Title** (required)
- **Author** (required if provided, otherwise ask)
- **Type** (book, article, paper — default: book)
- **Priority** (high, medium, low — default: medium)
- **Notes** (optional, any context the user provides about why they want to read it)

If title or author is missing, ask the user before proceeding.

### Step 2: Locate or Create the Reading List File

The reading list is stored at `$PAI_DIR/data/ReadingList.md`.

If the file does not exist, create it with this header:

```markdown
# Reading List

| Status | Title | Author | Type | Rating | Date Added | Date Finished | Priority | Notes |
|--------|-------|--------|------|--------|------------|---------------|----------|-------|
```

### Step 3: Add the Entry

Append a new row to the table:
- **Status:** `to-read`
- **Title:** From user input
- **Author:** From user input
- **Type:** book, article, or paper
- **Rating:** `-` (unrated)
- **Date Added:** Today's date (YYYY-MM-DD)
- **Date Finished:** `-`
- **Priority:** high, medium, or low
- **Notes:** From user input or `-`

### Step 4: Confirm

Report back to the user:
- What was added (title, author)
- Current count of items in each status category
