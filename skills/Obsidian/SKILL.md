---
name: Obsidian
description: Knowledge management with Obsidian. USE WHEN saving to obsidian, notes, vault, research, learnings, knowledge capture, mermaid diagrams, dataview queries. Knows vault location, best practices, diagram types, and features.
---

# Obsidian Skill

Knowledge capture and organization using Obsidian vault.

## Vault Location

```
Path: C:\Users\fujos\Obsidian
```

PAI has direct read/write access.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **SaveNote** | "save to obsidian", "create note", "add to vault" | `Workflows/SaveNote.md` |
| **CreateExcalidrawDiagram** | "create excalidraw", "draw diagram", "sketch this" | `Workflows/CreateExcalidrawDiagram.md` |
| **ExcalidrawToMermaid** | "convert to mermaid", "make this code-based" | `Workflows/ExcalidrawToMermaid.md` |

## Context Files

Load these on-demand when specific reference is needed:

| File | Content |
|------|---------|
| `Syntax.md` | Wiki links, tags, embeds, callouts, formatting |
| `Properties.md` | YAML frontmatter, property types |
| `Canvas.md` | Infinite whiteboard, node types |
| `MermaidDiagrams.md` | All diagram types (flowchart, sequence, gantt, etc.) |
| `Dataview.md` | Query syntax, TABLE/LIST/TASK/CALENDAR |
| `Templater.md` | Dynamic templates, tp object reference |
| `WorkflowPatterns.md` | Zettelkasten, PARA, GTD, MOCs |
| `Excalidraw.md` | Hand-drawn diagrams overview, quick reference (see workflows/Excalidraw/ for full docs) |
| `Plugins.md` | Core and community plugin reference |

## Examples

**Example 1: Save research findings**
```
User: "Save this to my obsidian vault as research"
→ Invokes SaveNote workflow
→ Creates note in Research/ folder with frontmatter
→ Returns: file path, tags applied, suggested links
```

**Example 2: Create a Mermaid diagram**
```
User: "Create a flowchart for this process"
→ Loads MermaidDiagrams.md for syntax reference
→ Generates mermaid code block with flowchart
→ Returns: diagram code ready for Obsidian
```

**Example 3: Query notes with Dataview**
```
User: "How do I find all notes tagged #project?"
→ Loads Dataview.md for query syntax
→ Provides: dataview query with FROM and WHERE clauses
```

**Example 4: Create Excalidraw diagram**
```
User: "Create an architecture diagram in Excalidraw"
→ Invokes CreateExcalidrawDiagram workflow
→ Loads workflows/Excalidraw/ docs as needed
→ Generates .excalidraw file via API
→ Returns: file path, elements created, embed syntax
```

## Quick Reference

```
VAULT:      C:\Users\fujos\Obsidian

LINKS:      [[Note]] | [[Note|Alias]] | [[Note#Heading]] | [[Note#^block]]
EMBEDS:     ![[Note]] | ![[image.png|300]] | ![[Note#^block]]
TAGS:       #tag | #parent/child | tags: [a, b]
CALLOUT:    > [!type] Title
DIAGRAM:    ```mermaid ... ```
TASK:       - [ ] unchecked | - [x] done
HIGHLIGHT:  ==text==

DIAGRAMS:   flowchart | sequence | state | pie | gantt | mindmap | erDiagram
```
