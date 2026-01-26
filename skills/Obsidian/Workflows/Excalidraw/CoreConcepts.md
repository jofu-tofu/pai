# Core Concepts

Understanding the Excalidraw canvas model and file format.

---

## Canvas Model

Excalidraw uses an **infinite 2D coordinate space**:
- Origin `(0, 0)` is at the top-left of the viewport
- X increases to the right, Y increases downward
- No bounds - elements can be positioned anywhere
- Z-index controls layering (higher values appear on top)

### Coordinate System
```
(0,0) ────────→ X
  │
  │
  │
  ↓
  Y
```

---

## Element Structure

Every Excalidraw element is a JSON object with core properties:

```json
{
  "id": "unique-element-id",
  "type": "rectangle",
  "x": 100,
  "y": 200,
  "width": 300,
  "height": 150,
  "angle": 0,
  "strokeColor": "#000000",
  "backgroundColor": "#ffffff",
  "fillStyle": "hachure",
  "strokeWidth": 1,
  "roughness": 1,
  "opacity": 100,
  "groupIds": [],
  "roundness": null,
  "seed": 12345,
  "version": 1,
  "versionNonce": 67890,
  "isDeleted": false,
  "boundElements": null,
  "updated": 1706400000000,
  "link": null,
  "locked": false
}
```

### Core Properties (All Elements)
- **id**: Unique identifier
- **type**: Element type (rectangle, ellipse, arrow, text, etc.)
- **x, y**: Top-left corner position
- **width, height**: Dimensions
- **angle**: Rotation in radians
- **strokeColor**: Border color (hex)
- **backgroundColor**: Fill color (hex)
- **fillStyle**: hachure | cross-hatch | solid
- **strokeWidth**: 1 (thin) | 2 (bold) | 4 (extra-bold)
- **roughness**: 0 (architect) | 1 (artist) | 2 (cartoonist)
- **opacity**: 0-100
- **groupIds**: Array of group IDs this element belongs to

---

## File Format

Excalidraw files (`.excalidraw`) are JSON:

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [
    {
      "id": "element-1",
      "type": "rectangle",
      ...
    },
    {
      "id": "element-2",
      "type": "arrow",
      ...
    }
  ],
  "appState": {
    "viewBackgroundColor": "#ffffff",
    "currentItemStrokeColor": "#000000",
    "currentItemBackgroundColor": "#ffffff",
    "gridSize": null,
    "zoom": 1
  },
  "files": {}
}
```

### Top-Level Structure
- **type**: Always `"excalidraw"`
- **version**: File format version (current: 2)
- **elements**: Array of all diagram elements
- **appState**: Canvas settings, view state, defaults
- **files**: Embedded images (base64 or file references)

---

## Element Lifecycle

Typical flow for creating and manipulating elements:

```
1. CREATE    → Add element with position and dimensions
2. STYLE     → Set colors, stroke, fill, roughness
3. POSITION  → Adjust x, y, angle, z-index
4. GROUP     → Combine related elements
5. LINK      → Bind elements together (arrows to shapes)
6. EXPORT    → Save as .excalidraw JSON or image
```

### Example Lifecycle (via API)
```javascript
const ea = ExcalidrawAutomate.plugin;

// 1. CREATE
const rectId = ea.addRect(100, 100, 200, 100);

// 2. STYLE
ea.setStrokeColor("#1e90ff", rectId);
ea.setFillStyle("solid", rectId);

// 3. POSITION
ea.moveElement(rectId, 150, 150);
ea.rotateElement(rectId, Math.PI / 4);

// 4. GROUP
const groupId = ea.group([rectId, otherId]);

// 5. LINK (for arrows)
ea.connectElements(arrowId, rectId, "start");

// 6. EXPORT
ea.create();  // Renders to canvas
```

---

## Version Compatibility

- **v1 format**: Legacy, limited features
- **v2 format**: Current, supports all features
- Obsidian-Excalidraw plugin uses v2
- Forward compatible: newer features gracefully degrade

**Best practice:** Always save as v2 format when creating via API.

---

## Key Takeaways

1. **Infinite canvas**: No boundaries, position anywhere
2. **JSON-based**: Files are human-readable and scriptable
3. **Element-centric**: Everything is an element with properties
4. **Coordinate system**: (0,0) top-left, X right, Y down
5. **Grouping & linking**: Elements can be combined or connected
6. **Roughness aesthetic**: Configurable hand-drawn style (0-2)
