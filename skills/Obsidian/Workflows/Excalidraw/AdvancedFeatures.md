# Advanced Features

LaTeX math, images, libraries, frames, and advanced Excalidraw capabilities.

---

## LaTeX Math Support

Excalidraw can render LaTeX mathematical formulas.

### Adding LaTeX via API
```javascript
ea.addLaTeX(x, y, "E = mc^2");

// Complex equations
ea.addLaTeX(200, 100, "\\sum_{i=1}^{n} x_i = \\mu");
ea.addLaTeX(300, 200, "\\frac{dy}{dx} = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}");

// Matrix notation
ea.addLaTeX(100, 300, "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}");
```

### Interactive LaTeX (UI)
1. Select "Formula" tool (or press `Ctrl/Cmd + Shift + M`)
2. Click on canvas
3. Type LaTeX in dialog
4. Click "Insert"

### Common LaTeX Symbols
```latex
# Greek letters
\alpha, \beta, \gamma, \Delta, \Sigma, \Omega

# Operators
\sum, \prod, \int, \lim, \frac{a}{b}, \sqrt{x}, x^2, x_i

# Relations
\leq, \geq, \neq, \approx, \equiv, \in, \subset

# Logic
\land, \lor, \neg, \implies, \forall, \exists

# Delimiters
\left( ... \right), \left[ ... \right], \left\{ ... \right\}
```

### Use Cases
- Technical documentation
- Physics/math diagrams
- Algorithm notation
- Formula explanations

**Note:** LaTeX elements are rendered as images, not editable text.

---

## Image Handling

### Adding Images via Drag-and-Drop
1. Open Excalidraw diagram
2. Drag image file onto canvas
3. Resize and position

### Adding Images via API
```javascript
// From vault file
const file = app.vault.getAbstractFileByPath("Images/logo.png");
await ea.addImage(100, 100, file);

// From data URL (base64)
const dataURL = "data:image/png;base64,iVBORw0KG...";
ea.addImageFromDataURL(200, 200, dataURL, 150, 100);

// From URL (requires internet)
const url = "https://example.com/image.png";
// Note: Direct URL loading may be restricted, prefer vault files or data URLs
```

### Image Properties
```javascript
{
  type: "image",
  x: 100,           // Top-left X
  y: 100,           // Top-left Y
  width: 200,       // Display width
  height: 150,      // Display height
  fileId: "...",    // Reference to files object
  scale: 1.0,       // Zoom level
  status: "saved"   // "pending" | "saved"
}
```

### Image Formats Supported
- PNG
- JPG/JPEG
- SVG
- GIF
- WebP

### Use Cases
- Screenshots in documentation
- Logos and branding
- Reference images (UI mockups)
- Icons and symbols
- Embedded charts/graphs

---

## Element Libraries

Libraries allow saving and reusing groups of elements.

### Creating a Library Item (UI)
1. Select elements to save
2. Click library button (📚)
3. Click "Add to library"
4. Name the library item

### Creating a Library Item (API)
```javascript
// Save selection as library item
ea.addToLibrary([elementId1, elementId2, elementId3], "Component Template");
```

### Using Library Items (UI)
1. Click library button
2. Browse library
3. Click item to insert on canvas

### Using Library Items (API)
```javascript
const library = ea.getLibrary();
const itemId = library[0].id;
ea.addFromLibrary(itemId, 300, 200);
```

### Community Libraries
Excalidraw has a growing collection of community-contributed libraries:
- **UI Components**: Buttons, forms, icons
- **Architecture**: AWS, Azure, GCP icons
- **Diagrams**: Flowchart shapes, UML symbols
- **Mockups**: Mobile, web, desktop frames

**Access:** Download `.excalidrawlib` files and load via library panel.

### Use Cases
- Reusable component templates
- Consistent design systems
- Standard diagram symbols
- Repeated patterns

---

## Frames

Frames are container elements for organizing and presenting diagrams.

### Creating Frames (UI)
1. Select "Frame" tool
2. Drag to create frame area
3. Name the frame
4. Add elements inside frame bounds

### Creating Frames (API)
```javascript
const frameId = ea.addFrame(0, 0, 800, 600, {
  name: "Slide 1: Introduction"
});

// Add elements inside frame (position within bounds)
ea.addText(50, 50, "Welcome", {fontSize: 48});
ea.addRect(100, 150, 600, 300, {text: "Content area"});
```

### Frame Properties
```javascript
{
  type: "frame",
  x: 0,
  y: 0,
  width: 800,
  height: 600,
  name: "Slide 1"
}
```

### Frame Navigation
- Use arrow keys to navigate between frames
- Export individual frames as separate images
- Present diagrams like slides

### Embedding Specific Frames
```markdown
![[diagram.excalidraw#^frame1]]
```
Shows only the content of that frame.

### Use Cases
- **Presentations**: Each frame is a slide
- **Sections**: Organize large diagrams into logical sections
- **Exportable sub-diagrams**: Export frames individually
- **Storyboards**: Sequential visual narratives

---

## Groups

Groups allow moving and manipulating multiple elements together.

### Creating Groups (UI)
1. Select multiple elements (Shift + click or drag-select)
2. Right-click → "Group" (or `Ctrl/Cmd + G`)

### Creating Groups (API)
```javascript
const groupId = ea.group([elementId1, elementId2, elementId3]);
```

### Group Operations
```javascript
// Ungroup
ea.ungroup(groupId);

// Move group
ea.moveElement(groupId, 300, 200);

// Rotate group
ea.rotateElement(groupId, Math.PI / 4);

// Style entire group
ea.setStrokeColor("#1e90ff", groupId);
```

### Group vs Frame
| Feature | Group | Frame |
|---------|-------|-------|
| **Selection** | Moves/resizes together | Contains elements |
| **Export** | No boundary | Exports as separate image |
| **Navigation** | No navigation | Arrow key navigation |
| **Visibility** | No visual boundary | Visible frame border |

**Use groups** for related elements that move together.
**Use frames** for presentation sections or exportable areas.

---

## SVG Import

Convert SVG graphics to Excalidraw elements.

### Importing SVG (API)
```javascript
const svgString = `
<svg width="200" height="200">
  <rect x="10" y="10" width="180" height="180" fill="#1e90ff" />
  <circle cx="100" cy="100" r="50" fill="#fff" />
</svg>
`;

ea.importSVG(svgString, 100, 100, {
  scale: 1.5,
  preserveAspectRatio: true
});
```

### Import Options
- `scale`: Resize on import (1.0 = original size)
- `preserveAspectRatio`: Maintain width/height ratio
- Position: Top-left corner (x, y)

### Limitations
- Complex SVG paths may not convert perfectly
- Text in SVG becomes Excalidraw text elements
- Gradients/filters not supported (converts to solid fills)

### Use Cases
- Import logos and icons
- Convert design assets
- Reuse existing SVG graphics

---

## Text-in-Shapes

Add text labels directly inside shapes.

### Adding Text to Shapes
```javascript
ea.addRect(100, 100, 200, 150, {
  text: "API Server",
  fontSize: 20,
  textAlign: "center",
  verticalAlign: "middle"
});
```

### Text Alignment Options
- `textAlign`: `"left"` | `"center"` | `"right"`
- `verticalAlign`: `"top"` | `"middle"` | `"bottom"`

### Multi-line Text
```javascript
ea.addRect(100, 100, 250, 150, {
  text: "Line 1\nLine 2\nLine 3",
  textAlign: "center",
  verticalAlign: "middle"
});
```

**Tip:** Use `\n` for line breaks.

---

## Binding & Connections

Bind arrows to shapes so they stay connected when moved.

### Binding Arrows (API)
```javascript
// Create shapes
const rect1 = ea.addRect(100, 100, 200, 100);
const rect2 = ea.addRect(400, 100, 200, 100);

// Create arrow
const arrow = ea.addArrow([[300, 150], [400, 150]], {
  endArrowhead: "arrow"
});

// Bind arrow to shapes
ea.connectElements(arrow, rect1, "start");
ea.connectElements(arrow, rect2, "end");
```

### Binding Behavior
- Moving bound shapes repositions arrow endpoints
- Deleting bound shape removes arrow
- Arrow "sticks" to shape perimeter

### Use Cases
- Architecture diagrams (components stay connected)
- Flowcharts (process flows follow moves)
- Relationship diagrams (links persist)

---

## Custom Fonts

Excalidraw supports three font families:

### Font Families
```javascript
fontFamily: 1  // Virgil (handwriting)
fontFamily: 2  // Helvetica (sans-serif)
fontFamily: 3  // Cascadia (monospace)
```

**Custom fonts:** Not directly supported, but can use:
1. Create text as SVG with custom font
2. Import SVG to Excalidraw
3. Text becomes path data (non-editable)

---

## Collaboration (Excalidraw+ / Live)

**Obsidian-Excalidraw** supports local collaboration via:
- Shared vaults (Obsidian Sync, iCloud, Dropbox)
- Git-based workflows (JSON files merge reasonably well)

**Excalidraw.com Live:**
- Real-time collaboration (not in Obsidian plugin)
- Can export/import `.excalidraw` files between web and Obsidian

---

## Export Options

### Export via API
```javascript
// PNG export
ea.exportAsPNG("diagram.png", 2);  // 2x resolution

// SVG export
ea.exportAsSVG("diagram.svg");
```

### Export via UI
1. Click "Export" button
2. Choose format: PNG, SVG, Clipboard
3. Set resolution (1x, 2x, 4x)
4. Configure background (transparent or solid)

### Auto-Export (Obsidian Plugin)
Set in frontmatter:
```yaml
---
excalidraw-autoexport: png
excalidraw-autoexport-padding: 10
---
```

Automatically exports PNG on save.

---

## Best Practices for Advanced Features

1. **LaTeX**: Use for math/formulas only (not general text)
2. **Images**: Keep image files in vault, avoid hotlinking
3. **Libraries**: Build a library of reusable components for consistency
4. **Frames**: Use for presentations and exportable sections
5. **Groups**: Group related elements, but don't over-group
6. **SVG Import**: Test imports, some SVGs may not convert cleanly
7. **Bindings**: Always bind arrows to shapes in structured diagrams
8. **Collaboration**: Use Git for version control of `.excalidraw` files
