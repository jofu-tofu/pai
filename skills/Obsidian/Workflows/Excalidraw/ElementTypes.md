# Element Types

All 9 Excalidraw element types with properties and usage.

---

## 1. Rectangle

**Type:** `rectangle`

**Properties:**
- `x, y`: Top-left corner position
- `width, height`: Dimensions
- `strokeColor, backgroundColor`: Border and fill colors
- `fillStyle`: `hachure` | `cross-hatch` | `solid`
- `roundness`: `null` (sharp) or `{type: number}` for rounded corners

**Create via API:**
```javascript
ea.addRect(x, y, width, height, {
  strokeColor: "#000000",
  backgroundColor: "#ffffff",
  fillStyle: "hachure",
  text: "Label"
});
```

**Common use cases:**
- System components in architecture diagrams
- Process boxes in flowcharts
- Container elements for grouping
- UI mockup elements

---

## 2. Ellipse

**Type:** `ellipse`

**Properties:**
- `x, y`: Center position (unlike rectangle!)
- `width, height`: Diameter dimensions
- `strokeColor, backgroundColor`: Border and fill
- `fillStyle`: `hachure` | `cross-hatch` | `solid`

**Create via API:**
```javascript
ea.addEllipse(x, y, width, height, {
  fillStyle: "solid",
  backgroundColor: "#e0f7fa",
  text: "Concept"
});
```

**Common use cases:**
- Concept bubbles in mind maps
- Start/end terminals in flowcharts
- Highlighting important elements
- Organic, soft visual elements

---

## 3. Diamond

**Type:** `diamond`

**Properties:**
- `x, y`: Center position
- `width, height`: Diamond dimensions
- `strokeColor, backgroundColor`: Border and fill
- `fillStyle`: `hachure` | `cross-hatch` | `solid`

**Create via API:**
```javascript
ea.addDiamond(x, y, width, height, {
  text: "Decision?",
  backgroundColor: "#fff9c4"
});
```

**Common use cases:**
- Decision points in flowcharts
- Conditional branches
- Yes/no questions
- Gateway symbols

---

## 4. Arrow

**Type:** `arrow`

**Properties:**
- `points`: Array of `[x, y]` coordinates defining path
- `strokeColor`: Line color
- `strokeWidth`: 1 | 2 | 4
- `startArrowhead`: `null` | `"arrow"` | `"bar"` | `"dot"`
- `endArrowhead`: `null` | `"arrow"` | `"bar"` | `"dot"`
- `startBinding`: Connect to element (by ID)
- `endBinding`: Connect to element (by ID)

**Create via API:**
```javascript
ea.addArrow([x1, y1], [x2, y2], {
  strokeColor: "#1e90ff",
  strokeWidth: 2,
  startArrowhead: "dot",
  endArrowhead: "arrow"
});

// Multi-point arrow (with bend)
ea.addArrow([
  [x1, y1],
  [x2, y2],
  [x3, y3]
], {endArrowhead: "arrow"});
```

**Common use cases:**
- Data flow in diagrams
- Relationships between components
- Process sequence
- Directional connections

---

## 5. Line

**Type:** `line`

**Properties:**
- `points`: Array of `[x, y]` coordinates
- `strokeColor`: Line color
- `strokeWidth`: 1 | 2 | 4
- `strokeStyle`: `"solid"` | `"dashed"` | `"dotted"`
- No arrowheads (use arrow type instead)

**Create via API:**
```javascript
ea.addLine([
  [x1, y1],
  [x2, y2],
  [x3, y3]
], {
  strokeStyle: "dashed",
  strokeWidth: 1
});
```

**Common use cases:**
- Non-directional connections
- Boundaries and separators
- Underlines and emphasis
- Freeform paths

---

## 6. Freedraw

**Type:** `freedraw`

**Properties:**
- `points`: Array of `[x, y]` coordinates (hand-drawn path)
- `strokeColor`: Line color
- `strokeWidth`: 1 | 2 | 4
- `pressures`: Array of pressure values (for stylus input)

**Create via API:**
```javascript
// Freedraw is typically interactive, but can be scripted
const points = [[0, 0], [10, 5], [20, -2], [30, 8]];
ea.addFreedraw(points, {
  strokeColor: "#ff6b6b",
  strokeWidth: 2
});
```

**Common use cases:**
- Hand-drawn annotations
- Sketched shapes
- Freeform highlights
- Signatures or doodles

---

## 7. Text

**Type:** `text`

**Properties:**
- `x, y`: Top-left position
- `text`: String content
- `fontSize`: Number (default: 20)
- `fontFamily`: 1 (Virgil - handwriting) | 2 (Helvetica) | 3 (Cascadia - monospace)
- `textAlign`: `"left"` | `"center"` | `"right"`
- `verticalAlign`: `"top"` | `"middle"`
- `strokeColor`: Text color
- `width, height`: Auto-calculated from text content

**Create via API:**
```javascript
ea.addText(x, y, "Hello World", {
  fontSize: 24,
  fontFamily: 1,  // Handwriting style
  strokeColor: "#000000",
  textAlign: "center"
});
```

**Common use cases:**
- Labels and annotations
- Diagram titles
- Explanatory notes
- Standalone text blocks

---

## 8. Image

**Type:** `image`

**Properties:**
- `x, y`: Top-left position
- `width, height`: Dimensions
- `fileId`: Reference to file in `files` object
- `scale`: Zoom level (default: 1)
- `status`: `"pending"` | `"saved"`

**Create via API:**
```javascript
// Add image from file
await ea.addImage(x, y, file);

// Or from dataURL
ea.addImageFromDataURL(x, y, dataURL, width, height);
```

**Common use cases:**
- Screenshots in diagrams
- Icons and logos
- Reference images
- Visual mockups

---

## 9. Frame

**Type:** `frame`

**Properties:**
- `x, y`: Top-left position
- `width, height`: Frame dimensions
- `name`: Frame label
- Elements inside frame are grouped by containment

**Create via API:**
```javascript
const frameId = ea.addFrame(x, y, width, height, {
  name: "Slide 1"
});

// Add elements to frame (position them inside bounds)
```

**Common use cases:**
- Presentation slides
- Section containers
- Grouped content areas
- Exportable sub-diagrams

---

## Element Type Summary

| Type | Identifier | Primary Use | Positioning |
|------|------------|-------------|-------------|
| **Rectangle** | `rectangle` | Boxes, containers | Top-left (x, y) |
| **Ellipse** | `ellipse` | Bubbles, concepts | Center (x, y) |
| **Diamond** | `diamond` | Decisions | Center (x, y) |
| **Arrow** | `arrow` | Directional flow | Points array |
| **Line** | `line` | Connections | Points array |
| **Freedraw** | `freedraw` | Sketches | Points array |
| **Text** | `text` | Labels | Top-left (x, y) |
| **Image** | `image` | Graphics | Top-left (x, y) |
| **Frame** | `frame` | Containers | Top-left (x, y) |

---

## Choosing the Right Type

**For structured diagrams:**
- Components → Rectangle
- Concepts/states → Ellipse
- Decisions → Diamond
- Flow → Arrow

**For freeform work:**
- Annotations → Freedraw
- Emphasis → Line (dashed)
- Labels → Text
- Visual context → Image

**For organization:**
- Sections → Frame
- Groups → Use `groupIds` property
