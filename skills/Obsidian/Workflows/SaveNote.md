# SaveNote Workflow

> **Trigger:** "save to obsidian", "create note", "add to vault"

## Purpose

Save content to the Obsidian vault with proper formatting and metadata.

## Steps

### Step 1: Determine Note Type

Ask or infer note type:
- **Research**: Findings, discoveries, learnings
- **Reference**: Documentation, how-to guides
- **Project**: Project-related notes
- **Daily**: Daily log entries
- **Concept**: Atomic idea notes

### Step 2: Choose Location

Based on note type:
```
Research     → C:\Users\fujos\Obsidian\Research\
Reference    → C:\Users\fujos\Obsidian\Reference\
Project      → C:\Users\fujos\Obsidian\Projects\[ProjectName]\
Daily        → C:\Users\fujos\Obsidian\Daily\
Concept      → C:\Users\fujos\Obsidian\Concepts\
```

### Step 3: Format Content

Apply Obsidian formatting:
1. Add YAML frontmatter with created date, tags
2. Use proper heading hierarchy
3. Convert any diagrams to Mermaid if applicable
4. Add wiki links for related concepts
5. Use callouts for important notes

### Step 4: Write File

```bash
# Write to vault
Write file to: C:\Users\fujos\Obsidian\[location]\[filename].md
```

### Step 5: Confirm

Report:
- File path created
- Tags applied
- Links suggested

## Example Output

```
SAVED: Research/AI-Agent-Patterns.md
Tags: #research #ai #agents
Suggested Links: [[Agent Architecture]], [[LLM Patterns]]
```
