# Automate API Reference

Complete reference for ExcalidrawAutomate - programmatic diagram creation.

---

## Initialization

```javascript
// Access the ExcalidrawAutomate plugin instance
const ea = ExcalidrawAutomate.plugin;

// Or get from plugin registry
const ea = app.plugins.plugins["obsidian-excalidraw-plugin"].excalidrawAutomate;
```

---

## Element Creation Methods

### Shapes

#### `addRect(x, y, width, height, options)`
Creates a rectangle.

```javascript
ea.addRect(100, 100, 200, 150, {
  text: "Component",
  strokeColor: "#1e90ff",
  backgroundColor: "#e0f7fa",
  fillStyle: "solid",
  roundness: {type: 3}
});
```

#### `addEllipse(x, y, width, height, options)`
Creates an ellipse (centered at x, y).

```javascript
ea.addEllipse(300, 200, 180, 120, {
  text: "Process",
  fillStyle: "hachure",
  backgroundColor: "#fff9c4"
});
```

#### `addDiamond(x, y, width, height, options)`
Creates a diamond shape (centered).

```javascript
ea.addDiamond(500, 200, 150, 100, {
  text: "Decision?",
  backgroundColor: "#ffccbc"
});
```

### Connections

#### `addArrow(points, options)`
Creates an arrow with one or more segments.

```javascript
// Simple arrow
ea.addArrow([[x1, y1], [x2, y2]], {
  strokeColor: "#757575",
  strokeWidth: 2,
  endArrowhead: "arrow"
});

// Multi-segment arrow (with bends)
ea.addArrow([
  [100, 100],
  [200, 150],
  [300, 100]
], {
  startArrowhead: "dot",
  endArrowhead: "arrow"
});
```

#### `addLine(points, options)`
Creates a line without arrowheads.

```javascript
ea.addLine([[x1, y1], [x2, y2]], {
  strokeStyle: "dashed",
  strokeWidth: 1
});
```

### Text & Annotations

#### `addText(x, y, text, options)`
Adds standalone text.

```javascript
ea.addText(100, 50, "System Architecture", {
  fontSize: 32,
  fontFamily: 2,  // Helvetica
  textAlign: "center",
  strokeColor: "#000000"
});
```

#### `addLaTeX(x, y, latex)`
Adds LaTeX math formula.

```javascript
ea.addLaTeX(400, 100, "E = mc^2");
ea.addLaTeX(200, 300, "\\sum_{i=1}^{n} x_i");
```

### Images

#### `addImage(x, y, file)`
Adds an image from file reference.

```javascript
const file = app.vault.getAbstractFileByPath("Images/logo.png");
await ea.addImage(100, 100, file);
```

#### `addImageFromDataURL(x, y, dataURL, width, height)`
Adds image from base64 data URL.

```javascript
ea.addImageFromDataURL(200, 200, "data:image/png;base64,...", 200, 150);
```

### Advanced Elements

#### `addFrame(x, y, width, height, options)`
Creates a frame container.

```javascript
const frameId = ea.addFrame(0, 0, 800, 600, {
  name: "Slide 1"
});
```

#### `addFreedraw(points, options)`
Creates a freehand drawn path.

```javascript
const points = [[0, 0], [10, 5], [20, -2], [30, 8], [40, 0]];
ea.addFreedraw(points, {
  strokeColor: "#ff6b6b",
  strokeWidth: 2
});
```

---

## Canvas Management

### `create(filename, foldername, templatePath, onNewPane)`
Creates and saves the diagram.

```javascript
// Create new diagram
ea.create("MyDiagram", "Diagrams/");

// Create on new pane
ea.create("MyDiagram", "Diagrams/", null, true);

// Create from template
ea.create("MyDiagram", "Diagrams/", "Templates/base.excalidraw");
```

### `clear()`
Clears all elements from canvas.

```javascript
ea.clear();
```

### `reset()`
Resets the plugin state.

```javascript
ea.reset();
```

---

## Element Manipulation

### `getElements()`
Returns array of all elements.

```javascript
const elements = ea.getElements();
console.log(`Total elements: ${elements.length}`);
```

### `getElement(id)`
Gets specific element by ID.

```javascript
const element = ea.getElement(elementId);
console.log(element.type, element.x, element.y);
```

### `deleteElement(id)`
Removes element from canvas.

```javascript
ea.deleteElement(elementId);
```

### `moveElement(id, x, y)`
Repositions element.

```javascript
ea.moveElement(elementId, 300, 200);
```

### `rotateElement(id, angle)`
Rotates element (angle in radians).

```javascript
ea.rotateElement(elementId, Math.PI / 4);  // 45 degrees
```

---

## Styling Methods

### `setStrokeColor(color, elementId)`
Sets stroke color for element.

```javascript
ea.setStrokeColor("#1e90ff", elementId);
```

### `setBackgroundColor(color, elementId)`
Sets fill color for element.

```javascript
ea.setBackgroundColor("#e0f7fa", elementId);
```

### `setFillStyle(style, elementId)`
Sets fill style: "hachure", "cross-hatch", or "solid".

```javascript
ea.setFillStyle("solid", elementId);
```

### `setStrokeWidth(width, elementId)`
Sets stroke width (1, 2, or 4).

```javascript
ea.setStrokeWidth(2, elementId);
```

### `setRoughness(roughness, elementId)`
Sets roughness: 0 (architect), 1 (artist), 2 (cartoonist).

```javascript
ea.setRoughness(0, elementId);  // Clean lines
```

### `setOpacity(opacity, elementId)`
Sets opacity (0-100).

```javascript
ea.setOpacity(50, elementId);  // Semi-transparent
```

---

## Layout & Positioning

### `group(elementIds)`
Groups elements together.

```javascript
const groupId = ea.group([elementId1, elementId2, elementId3]);
```

### `ungroup(groupId)`
Ungroups elements.

```javascript
ea.ungroup(groupId);
```

### `alignVertical(elementIds, alignment)`
Aligns elements vertically: "top", "middle", "bottom".

```javascript
ea.alignVertical([id1, id2, id3], "middle");
```

### `alignHorizontal(elementIds, alignment)`
Aligns elements horizontally: "left", "center", "right".

```javascript
ea.alignHorizontal([id1, id2, id3], "center");
```

### `distributeVertical(elementIds)`
Distributes elements evenly vertically.

```javascript
ea.distributeVertical([id1, id2, id3, id4]);
```

### `distributeHorizontal(elementIds)`
Distributes elements evenly horizontally.

```javascript
ea.distributeHorizontal([id1, id2, id3, id4]);
```

---

## Connection Management

### `connectElements(arrowId, elementId, endpoint)`
Binds arrow to element. Endpoint: "start" or "end".

```javascript
ea.connectElements(arrowId, rectId, "end");
ea.connectElements(arrowId, ellipseId, "start");
```

### `getConnectedElements(elementId)`
Returns all elements connected to given element.

```javascript
const connections = ea.getConnectedElements(rectId);
```

---

## Library Management

### `addToLibrary(elementIds, libraryName)`
Saves elements as reusable library item.

```javascript
ea.addToLibrary([rectId, arrowId, textId], "Component Template");
```

### `getLibrary()`
Returns all library items.

```javascript
const library = ea.getLibrary();
```

### `addFromLibrary(libraryItemId, x, y)`
Inserts library item at position.

```javascript
ea.addFromLibrary("item-123", 200, 200);
```

---

## Import & Export

### `importSVG(svgString, x, y, options)`
Converts SVG to Excalidraw elements.

```javascript
const svgData = '<svg>...</svg>';
ea.importSVG(svgData, 100, 100, {
  scale: 1.5,
  preserveAspectRatio: true
});
```

### `exportAsPNG(filename, scale)`
Exports canvas as PNG image.

```javascript
ea.exportAsPNG("diagram.png", 2);  // 2x resolution
```

### `exportAsSVG(filename)`
Exports canvas as SVG.

```javascript
ea.exportAsSVG("diagram.svg");
```

---

## Utility Methods

### `getBoundingBox(elementIds)`
Returns bounding box for set of elements.

```javascript
const bbox = ea.getBoundingBox([id1, id2, id3]);
// Returns: {x, y, width, height}
```

### `setViewport(x, y, zoom)`
Adjusts canvas view.

```javascript
ea.setViewport(0, 0, 1.5);  // Center at origin, 150% zoom
```

### `getCanvasSize()`
Returns current canvas dimensions.

```javascript
const {width, height} = ea.getCanvasSize();
```

---

## Common Patterns

### Pattern 1: Create Architecture Diagram
```javascript
const ea = ExcalidrawAutomate.plugin;
ea.clear();

// Components
const frontend = ea.addRect(50, 100, 200, 100, {
  text: "Frontend",
  fillStyle: "solid",
  backgroundColor: "#e3f2fd"
});

const backend = ea.addRect(350, 100, 200, 100, {
  text: "Backend API",
  fillStyle: "solid",
  backgroundColor: "#fff9c4"
});

const db = ea.addEllipse(500, 300, 180, 100, {
  text: "Database",
  fillStyle: "solid",
  backgroundColor: "#c8e6c9"
});

// Connections
ea.addArrow([[250, 150], [350, 150]], {endArrowhead: "arrow"});
ea.addArrow([[450, 200], [450, 250]], {endArrowhead: "arrow"});

// Title
ea.addText(200, 20, "System Architecture", {
  fontSize: 32,
  fontFamily: 2
});

ea.create("ArchitectureDiagram", "Diagrams/");
```

### Pattern 2: Auto-Layout Flowchart
```javascript
const ea = ExcalidrawAutomate.plugin;
ea.clear();

const steps = ["Start", "Process", "Decision?", "End"];
const elements = [];

// Create vertical flowchart
steps.forEach((label, i) => {
  const y = 100 + (i * 150);
  const id = i === 2
    ? ea.addDiamond(300, y, 200, 100, {text: label})
    : ea.addRect(250, y, 200, 80, {text: label});
  elements.push(id);

  // Add connecting arrow (except for last)
  if (i < steps.length - 1) {
    ea.addArrow([[350, y + 40], [350, y + 150 - 40]], {
      endArrowhead: "arrow"
    });
  }
});

ea.create("Flowchart", "Diagrams/");
```

### Pattern 3: Grid Layout
```javascript
const ea = ExcalidrawAutomate.plugin;
ea.clear();

const cols = 3, rows = 2;
const cellWidth = 180, cellHeight = 120;
const gap = 20;

for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const x = 50 + (col * (cellWidth + gap));
    const y = 50 + (row * (cellHeight + gap));
    ea.addRect(x, y, cellWidth, cellHeight, {
      text: `Item ${row * cols + col + 1}`
    });
  }
}

ea.create("GridLayout", "Diagrams/");
```

---

## Error Handling

```javascript
try {
  ea.create("MyDiagram", "Diagrams/");
} catch (error) {
  console.error("Failed to create diagram:", error);
  new Notice("Error creating Excalidraw diagram");
}
```

---

## Best Practices

1. **Always call `ea.clear()` before building new diagram** (prevents element accumulation)
2. **Store element IDs** if you need to modify/connect them later
3. **Use consistent spacing** for readability (50-100px between elements)
4. **Group related elements** for easier manipulation
5. **Set roughness=0 for technical diagrams**, roughness=1-2 for sketches
6. **Test arrow connections** - verify start/end bindings work as expected
7. **Use templates** for consistent styling across diagrams
