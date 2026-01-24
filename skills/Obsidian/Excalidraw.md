# Excalidraw in Obsidian

Excalidraw is a whiteboard plugin for hand-drawn diagrams.

---

## Key Features
- **Freehand drawing**: Sketch-style diagrams
- **LaTeX support**: Embed math formulas
- **SVG/PNG export**: High-quality exports
- **Obsidian integration**: Embed in notes with `![[drawing.excalidraw]]`
- **Collaborative**: Share drawings
- **OCR**: Text recognition (optional)

---

## When to Use Excalidraw vs Mermaid

| Use Excalidraw | Use Mermaid |
|----------------|-------------|
| Freeform sketches | Structured diagrams |
| Visual brainstorming | Code documentation |
| Architecture drawings | Automated generation |
| Custom visual styles | Version-controlled diagrams |

---

## Automate API

Excalidraw includes a scripting API for automation:
```javascript
// Access via ExcalidrawAutomate
ea.addText(0, 0, "Hello");
ea.addRect(0, 50, 100, 50);
ea.create();
```

---

## Linter Compatibility

Add to note frontmatter to exclude from Obsidian Linter:
```yaml
---
excalidraw-plugin: parsed
---
```
