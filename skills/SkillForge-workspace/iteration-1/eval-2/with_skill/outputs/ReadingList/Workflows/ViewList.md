# ViewList Workflow

> **Trigger:** "view reading list", "show reading list", "what am I reading", "what should I read", "book recommendations"

## Reference Material

- None.

## Purpose

Display the reading list with optional filtering, sorting, and summary statistics. Help the user decide what to read next.

## Workflow Steps

### Step 1: Parse the Request

Determine what the user wants to see:
- **Filter by status:** to-read, reading, finished, dropped, or all (default: all)
- **Filter by type:** book, article, paper, or all (default: all)
- **Filter by rating:** minimum rating threshold
- **Sort by:** date added, title, author, rating, priority (default: date added, newest first)
- **Summary mode:** If the user asks "what should I read", prioritize unread items by priority

### Step 2: Load the Reading List

Read the reading list file at `$PAI_DIR/data/ReadingList.md`.

If the file does not exist or is empty, inform the user that their reading list is empty and suggest using AddBook to get started.

### Step 3: Apply Filters and Sorting

Filter and sort the entries according to Step 1 parameters.

### Step 4: Display Results

Format the output based on context:

**Full list view (default):**
Display as a formatted markdown table with all columns.

**Status-filtered view:**
Display only matching entries, with a count header: "Showing N items with status: [status]"

**"What should I read" view:**
Show only "to-read" items, sorted by priority (high first), with a recommendation:
- Pick the highest-priority item added longest ago
- Present it as a suggestion: "Based on your list, consider reading [Title] by [Author] — it's been on your list since [date] and marked as [priority] priority."

**Summary statistics** (always included at the bottom):
- Total items on list
- Breakdown by status (N to-read, N reading, N finished, N dropped)
- Average rating of finished items (if any)
