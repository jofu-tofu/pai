# Integration Patterns

Obsidian-specific Excalidraw integration: embedding, linking, configuration.

---

## Embedding Excalidraw Diagrams

### Basic Embed Syntax
```markdown
![[drawing.excalidraw]]
```
Embeds the full diagram in your note.

### Sized Embed
```markdown
![[drawing.excalidraw|400]]
```
Specifies width in pixels (height scales proportionally).

### Embed Specific Frame
```markdown
![[drawing.excalidraw#^frame1]]
```
Embeds only the content of a named frame (useful for presentations).

### Embed with Caption
```markdown
![[drawing.excalidraw|400]]
*Figure 1: System Architecture*
```

---

## Frontmatter Configuration

Add to the **Excalidraw file's frontmatter** (not the embedding note):

### Enable Excalidraw Plugin Parsing
```yaml
---
excalidraw-plugin: parsed
---
```
**Required** for the plugin to recognize the file as an Excalidraw diagram.

### Auto-Export Settings
```yaml
---
excalidraw-plugin: parsed
excalidraw-autoexport: png
excalidraw-autoexport-dark: false
excalidraw-autoexport-padding: 10
---
```

**Options:**
- `excalidraw-autoexport`: `png` | `svg` | `both` | `none`
- `excalidraw-autoexport-dark`: `true` (dark mode) | `false` (light mode)
- `excalidraw-autoexport-padding`: Pixels of padding around exported image

### Default Styles
```yaml
---
excalidraw-plugin: parsed
excalidraw-default-mode: view
excalidraw-mask: true
---
```

**Options:**
- `excalidraw-default-mode`: `view` (read-only) | `zen` (edit mode)
- `excalidraw-mask`: `true` (dims embedded diagram) | `false` (full brightness)

---

## Linking Between Notes and Diagrams

### Link to Diagram from Note
```markdown
See the architecture overview: [[SystemArchitecture.excalidraw]]
```

### Link from Diagram to Note
In Excalidraw, select an element and use the link button, or:
```javascript
ea.addRect(100, 100, 200, 100, {
  text: "[[UserGuide]]",  // Wiki link
  link: "obsidian://vault/MyVault/UserGuide"
});
```
Clicking the element opens the linked note.

### Deep Links (Block References)
```markdown
![[drawing.excalidraw#^block123]]
```
Links to a specific element or frame by block ID.

---

## Obsidian Canvas Integration

### Embed Excalidraw in Canvas
1. Add a "File" card to Canvas
2. Select the `.excalidraw` file
3. Resize and position as needed

**Benefit:** Combine Excalidraw diagrams with notes, links, and other cards in infinite canvas view.

### Link Canvas to Excalidraw
Use Excalidraw for detailed diagrams, Canvas for high-level organization:
- Canvas: Project overview with linked diagrams
- Excalidraw: Detailed architecture, flows, mockups

---

## File Organization Recommendations

### Folder Structure
```
Obsidian Vault/
├── Diagrams/
│   ├── Architecture/
│   │   ├── SystemOverview.excalidraw
│   │   └── ComponentDetails.excalidraw
│   ├── Flows/
│   │   ├── UserJourney.excalidraw
│   │   └── DataFlow.excalidraw
│   └── Sketches/
│       └── Brainstorm-2026-01-25.excalidraw
└── Notes/
    └── ProjectDoc.md  (embeds diagrams)
```

**Naming conventions:**
- Use descriptive names: `AuthenticationFlow.excalidraw` (not `diagram1.excalidraw`)
- Date-stamp sketches: `Brainstorm-2026-01-25.excalidraw`
- Group by type or project

---

## Linter Compatibility

**Problem:** Obsidian Linter may try to format Excalidraw JSON files as markdown, breaking them.

**Solution:** Exclude Excalidraw files from linting.

### Method 1: Frontmatter (Recommended)
Add to each `.excalidraw` file:
```yaml
---
excalidraw-plugin: parsed
---
```
The Linter recognizes this and skips the file.

### Method 2: Linter Settings
In Obsidian Linter settings, add exclusion pattern:
```
Exclude files: **/*.excalidraw
```

### Method 3: Folder Exclusion
Organize all Excalidraw files in a `Diagrams/` folder and exclude that folder in Linter settings.

---

## Templater Integration

Use Templater to create Excalidraw diagrams from templates:

### Template File: `Templates/ExcalidrawTemplate.md`
```javascript
<%*
const ea = ExcalidrawAutomate.plugin;
ea.clear();

// Your template diagram structure
ea.addRect(100, 100, 200, 100, {text: "Title"});
ea.addText(50, 50, "<% tp.file.title %>", {fontSize: 32});

ea.create(tp.file.title, "Diagrams/");
%>
```

**Usage:** Run template via Templater, creates pre-structured diagram with dynamic content.

---

## Dataview Queries for Diagrams

List all Excalidraw diagrams:

```dataview
TABLE file.ctime as Created, file.mtime as Modified
FROM "Diagrams"
WHERE file.ext = "excalidraw"
SORT file.mtime DESC
```

Find diagrams tagged with specific topics:
```dataview
LIST
FROM "Diagrams"
WHERE contains(file.tags, "#architecture")
```

**Note:** Tags must be in frontmatter for Dataview to detect them:
```yaml
---
excalidraw-plugin: parsed
tags: [architecture, system-design]
---
```

---

## Mobile Considerations

**Obsidian Mobile + Excalidraw:**
- ✅ View diagrams (embeds render)
- ✅ Open diagrams in edit mode
- ⚠️ Limited drawing precision (use stylus for best results)
- ❌ ExcalidrawAutomate API not fully supported on mobile

**Best practice:** Create/edit complex diagrams on desktop, view and make light edits on mobile.

---

## Version Control (Git)

Excalidraw files are **JSON-based**, so:
- ✅ Git-friendly (text-based, diffable)
- ✅ Merge conflicts are human-readable
- ⚠️ Large diagrams can have verbose JSON

### `.gitignore` Recommendations
```gitignore
# Optionally exclude auto-exported images (if regenerating from .excalidraw)
*.excalidraw.png
*.excalidraw.svg

# Keep the source .excalidraw files
!*.excalidraw
```

**Tip:** Use auto-export to generate images on-demand, keep only `.excalidraw` source in git.

---

## Plugin Interactions

### Compatible Plugins
- **Dataview**: Query diagrams by metadata
- **Templater**: Create diagrams from templates
- **Canvas**: Embed diagrams in infinite canvas
- **Omnisearch**: Search text within Excalidraw files
- **Commander**: Add Excalidraw commands to toolbar

### Potential Conflicts
- **Linter**: May corrupt Excalidraw JSON (use frontmatter exclusion)
- **Advanced Tables**: No conflict (different file types)
- **Calendar**: Can link daily notes to dated diagrams

---

## Hotkeys & Commands

**Default Obsidian-Excalidraw commands:**
- `Ctrl/Cmd + N`: New Excalidraw diagram
- `Ctrl/Cmd + E`: Toggle edit/view mode
- `Ctrl/Cmd + Shift + E`: Export as PNG/SVG

**Customization:** Set custom hotkeys in Obsidian settings under "Hotkeys" → Search "Excalidraw".

---

## Performance Optimization

**For large vaults with many diagrams:**
1. **Auto-export only when needed** (disable auto-export, export manually)
2. **Use frames for large diagrams** (load only visible frame)
3. **Split complex diagrams** into multiple files (embed separately)
4. **Compress images** if embedding PNGs from auto-export

---

## Best Practices Summary

1. **Always add `excalidraw-plugin: parsed` frontmatter** to avoid linter issues
2. **Organize diagrams in dedicated folders** (e.g., `Diagrams/`)
3. **Use descriptive filenames** for easy searching
4. **Link diagrams to related notes** for context
5. **Auto-export to PNG** for faster loading in large notes
6. **Use frames for presentations** (embed specific frames)
7. **Create templates** for consistent diagram structures
8. **Tag diagrams** in frontmatter for Dataview queries
