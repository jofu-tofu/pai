# Excalidraw in Obsidian

Excalidraw is a whiteboard plugin for hand-drawn diagrams with powerful automation capabilities.

---

## Quick Start

### Embedding Diagrams
```markdown
![[drawing.excalidraw]]              # Full diagram
![[drawing.excalidraw|400]]          # Width specified
![[drawing.excalidraw#^frame1]]      # Specific frame
```

### Creating Diagrams
- **Interactive:** Click "New Excalidraw Drawing" in Obsidian
- **Programmatic:** Use workflows below for automated generation

---

## When to Use Excalidraw vs Mermaid

| Use Excalidraw | Use Mermaid |
|----------------|-------------|
| Freeform sketches | Structured diagrams |
| Visual brainstorming | Code documentation |
| Architecture drawings | Automated generation |
| Custom visual styles | Version-controlled diagrams |
| Hand-drawn aesthetic | Standardized formats |
| Pixel-perfect positioning | Auto-layout diagrams |

**Rule of thumb:** If it needs to look hand-drawn or requires precise control, use Excalidraw. If it's structured and needs to live in markdown, use Mermaid.

---

## Key Features

- **Freehand drawing**: Sketch-style diagrams with adjustable roughness (0-2)
- **9 element types**: Rectangle, ellipse, diamond, arrow, line, freedraw, text, image, frame
- **LaTeX support**: Embed math formulas with `\LaTeX` syntax
- **SVG/PNG export**: High-quality exports with auto-export option
- **Obsidian integration**: Embed in notes, link to other notes, Canvas integration
- **ExcalidrawAutomate API**: Programmatic diagram creation and manipulation
- **Libraries**: Reusable element collections for consistency
- **Frames**: Container elements for presentations and sections
- **Collaborative**: Share drawings (JSON-based, git-friendly)

---

## Workflows

### CreateExcalidrawDiagram
**Trigger:** "create excalidraw", "draw diagram", "sketch this"

Generates Excalidraw diagrams programmatically from descriptions.

**Example:**
```
User: "Create an architecture diagram for a web app"
→ Generates: 3-tier architecture (frontend, backend, database)
→ Saves: Diagrams/Architecture/WebAppArchitecture.excalidraw
→ Returns: Embed syntax and file path
```

See: [Workflows/CreateExcalidrawDiagram.md](Workflows/CreateExcalidrawDiagram.md)

### ExcalidrawToMermaid
**Trigger:** "convert to mermaid", "make this code-based"

Converts Excalidraw diagrams to Mermaid code for version control.

**Example:**
```
User: "Convert SystemArchitecture.excalidraw to Mermaid"
→ Analyzes: Elements and connections
→ Generates: Mermaid flowchart syntax
→ Saves: SystemArchitecture-mermaid.md
```

See: [Workflows/ExcalidrawToMermaid.md](Workflows/ExcalidrawToMermaid.md)

---

## Comprehensive Documentation

For detailed reference, see **[workflows/Excalidraw/Index.md](workflows/Excalidraw/Index.md)**

### Documentation Map
1. **[Core Concepts](workflows/Excalidraw/CoreConcepts.md)** - Canvas model, file format, element structure
2. **[Element Types](workflows/Excalidraw/ElementTypes.md)** - All 9 types with properties and examples
3. **[Styling System](workflows/Excalidraw/StylingSystem.md)** - Colors, strokes, fills, fonts, typography
4. **[Automate API](workflows/Excalidraw/AutomateAPI.md)** - Complete ExcalidrawAutomate reference
5. **[Integration Patterns](workflows/Excalidraw/IntegrationPatterns.md)** - Obsidian embedding, linking, frontmatter
6. **[Advanced Features](workflows/Excalidraw/AdvancedFeatures.md)** - LaTeX, images, libraries, frames, groups
7. **[Use Case Guide](workflows/Excalidraw/UseCaseGuide.md)** - When/how for different diagram types
8. **[GitHub Patterns](workflows/Excalidraw/GitHubPatterns.md)** - Implementation patterns from research

---

## Automate API Quick Reference

```javascript
const ea = ExcalidrawAutomate.plugin;

// Create elements
ea.addRect(x, y, width, height, {text: "Label"});
ea.addEllipse(x, y, width, height, {fillStyle: "solid"});
ea.addDiamond(x, y, width, height);
ea.addArrow([[x1, y1], [x2, y2]], {endArrowhead: "arrow"});
ea.addText(x, y, "Text", {fontSize: 20});
ea.addLaTeX(x, y, "E = mc^2");

// Style elements
ea.setStrokeColor("#1e90ff", elementId);
ea.setBackgroundColor("#e0f7fa", elementId);
ea.setFillStyle("solid", elementId);

// Layout
ea.group([id1, id2, id3]);
ea.alignVertical([id1, id2, id3], "middle");
ea.distributeHorizontal([id1, id2, id3]);

// Canvas management
ea.clear();
ea.create("DiagramName", "Diagrams/");
```

For full API documentation, see: [workflows/Excalidraw/AutomateAPI.md](workflows/Excalidraw/AutomateAPI.md)

---

## Linter Compatibility

**Important:** Add this frontmatter to all `.excalidraw` files to prevent Obsidian Linter from corrupting them:

```yaml
---
excalidraw-plugin: parsed
---
```

The Excalidraw plugin automatically adds this when creating diagrams. If creating files programmatically, always include this frontmatter.

**Alternative:** Exclude `.excalidraw` files in Linter settings:
```
Exclude files: **/*.excalidraw
```

---

## Common Use Cases

| Use Case | Approach | Key Elements |
|----------|----------|--------------|
| **Architecture diagrams** | Rectangles + arrows | Clean style (roughness: 0) |
| **User flows** | Diamonds + rectangles | Decision nodes + actions |
| **Brainstorming** | Ellipses + freedraw | Sketchy style (roughness: 2) |
| **Presentations** | Frames + groups | Sequential slides |
| **Mind maps** | Radial layout | Central concept + branches |
| **Technical diagrams** | Solid fills + images | Icons, precise positioning |

For detailed patterns and examples, see: [workflows/Excalidraw/UseCaseGuide.md](workflows/Excalidraw/UseCaseGuide.md)

---

## File Organization

Recommended structure:
```
Obsidian Vault/
└── Diagrams/
    ├── Architecture/        # System diagrams
    ├── Flows/               # User flows, processes
    └── Sketches/            # Brainstorms, whiteboard
```

**Naming:** Use descriptive names like `AuthenticationFlow.excalidraw` (not `diagram1.excalidraw`)

---

## Version Control

Excalidraw files are **JSON-based**, making them:
- ✅ Git-friendly (text-based, diffable)
- ✅ Merge-friendly (human-readable conflicts)
- ⚠️ Verbose (large diagrams = large JSON)

**Tip:** Use auto-export to generate images on-demand, keep only `.excalidraw` source in git.

---

## Resources

- **Official Excalidraw:** https://excalidraw.com
- **Obsidian Plugin:** Search "Excalidraw" in Community Plugins
- **Documentation:** [workflows/Excalidraw/Index.md](workflows/Excalidraw/Index.md) (comprehensive reference)
- **Workflows:** [Workflows/](Workflows/) (executable diagram generation)
