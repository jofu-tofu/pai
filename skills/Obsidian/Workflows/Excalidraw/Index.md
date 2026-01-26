# Excalidraw Documentation Hub

Comprehensive reference for creating and automating Excalidraw diagrams in Obsidian.

---

## Documentation Map

### Getting Started
1. **[Core Concepts](CoreConcepts.md)** - Canvas model, file format, element structure
2. **[Use Case Guide](UseCaseGuide.md)** - When/how to use, decision trees

### Reference
3. **[Element Types](ElementTypes.md)** - All 9 types with properties
4. **[Styling System](StylingSystem.md)** - Colors, strokes, fills, fonts
5. **[Automate API](AutomateAPI.md)** - ExcalidrawAutomate scripting reference
6. **[Advanced Features](AdvancedFeatures.md)** - LaTeX, images, libraries, frames

### Integration
7. **[Integration Patterns](IntegrationPatterns.md)** - Obsidian embedding, linking
8. **[GitHub Patterns](GitHubPatterns.md)** - Implementation patterns from research

---

## Quick Reference

### Common Element Creation
```javascript
const ea = ExcalidrawAutomate.plugin;

// Basic shapes
ea.addRect(x, y, width, height, {text: "Label"});
ea.addEllipse(x, y, width, height, {fillStyle: "solid"});
ea.addDiamond(x, y, width, height);

// Connections
ea.addArrow([x1, y1], [x2, y2], {
  startArrowhead: "arrow",
  endArrowhead: "arrow"
});

// Text and annotations
ea.addText(x, y, "Text", {fontSize: 20});
ea.addLaTeX(x, y, "E = mc^2");

// Canvas management
ea.create();  // Create diagram
ea.clear();   // Clear canvas
```

### Embedding Syntax
```markdown
![[drawing.excalidraw]]              # Full diagram
![[drawing.excalidraw|400]]          # Width specified
![[drawing.excalidraw#^frame1]]      # Specific frame
```

### Frontmatter Configuration
```yaml
---
excalidraw-plugin: parsed
excalidraw-autoexport: png
---
```

---

## Common Workflows

| Pattern | Elements | Use Case |
|---------|----------|----------|
| **Architecture diagram** | Rectangles + arrows + text | System components, layers |
| **Flow diagram** | Shapes + directional arrows + labels | Processes, decisions |
| **Sketch notes** | Freedraw + text + images | Brainstorming, visual thinking |
| **Presentation** | Frames + groups | Sequential slides, sections |
| **Concept map** | Ellipses + connecting lines | Ideas, relationships |

---

## Executable Workflows

- **[CreateExcalidrawDiagram](../../Workflows/CreateExcalidrawDiagram.md)** - Generate diagrams programmatically
- **[ExcalidrawToMermaid](../../Workflows/ExcalidrawToMermaid.md)** - Convert Excalidraw → Mermaid

---

## When to Use Excalidraw vs Mermaid

| Use Excalidraw | Use Mermaid |
|----------------|-------------|
| Freeform sketches, custom visual styles | Structured diagrams, standardized formats |
| Visual brainstorming, whiteboard sessions | Code documentation, automated generation |
| Architecture drawings with precise placement | Version-controlled diagrams in markdown |
| Presentations with frames and grouping | Diagrams that must be text-based |
| Hand-drawn aesthetic needed | Consistent, reproducible diagrams |

**Rule of thumb:** If it needs to look hand-drawn or requires pixel-perfect control, use Excalidraw. If it's structured and needs to live in markdown, use Mermaid.
