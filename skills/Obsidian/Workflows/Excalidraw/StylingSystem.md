# Styling System

This document provides the visual specifications for Excalidraw elements. Use it when you need exact values for colors, strokes, fills, and fonts.

---

## Color Assignment

You will assign colors based on what each element represents. This creates visual consistency that helps viewers understand relationships instantly.

### Semantic Color Palette

When creating elements, select colors by meaning:

| This element represents... | Use background | Use stroke | Example |
|----------------------------|----------------|------------|---------|
| Information, input, user data | #a5d8ff | #1971c2 | User requests, API inputs, form data |
| Success, output, storage | #b2f2bb | #2f9e44 | Databases, results, completed states |
| Warning, decision, process | #ffec99 | #f08c00 | Decision diamonds, processing steps |
| Error, stop, critical | #ffc9c9 | #e03131 | Error states, blocked flows, alerts |
| External, special, third-party | #d0bfff | #9c36b5 | External APIs, third-party services |
| Neutral, annotation, context | #e9ecef | #868e96 | Labels, notes, background info |

### Color Application Code

```javascript
// Information elements (blue)
ea.addRect(x, y, w, h, {
  backgroundColor: "#a5d8ff",
  strokeColor: "#1971c2"
});

// Success/storage elements (green)
ea.addEllipse(x, y, w, h, {
  backgroundColor: "#b2f2bb",
  strokeColor: "#2f9e44"
});

// Decision elements (yellow)
ea.addDiamond(x, y, w, h, {
  backgroundColor: "#ffec99",
  strokeColor: "#f08c00"
});

// Error/critical elements (red)
ea.addRect(x, y, w, h, {
  backgroundColor: "#ffc9c9",
  strokeColor: "#e03131"
});
```

### Color Consistency Rules

These rules maintain visual clarity:

| Rule | What it means | Why it matters |
|------|---------------|----------------|
| Same color = same meaning | If two things are blue, they represent the same category | Viewers learn the visual language once |
| Maximum 3-5 colors per diagram | Limit the palette | More colors create cognitive overhead |
| Color supplements, never carries | Meaning survives without color | Accessibility and printing |

### The 60-30-10 Ratio

Balance your diagram composition:

| Percentage | What fills it | What to check |
|------------|---------------|---------------|
| **60%** | Whitespace/background | If diagram feels cramped, add whitespace |
| **30%** | Primary elements | Main boxes, shapes, connectors |
| **10%** | Accent highlights | Critical paths, emphasis elements |

---

## Stroke Properties

Control border appearance and line weight.

### Stroke Width
```javascript
strokeWidth: 1    // Thin (default)
strokeWidth: 2    // Bold
strokeWidth: 4    // Extra bold
```

### Stroke Style
```javascript
strokeStyle: "solid"    // Continuous line
strokeStyle: "dashed"   // Dashed line
strokeStyle: "dotted"   // Dotted line
```

### Stroke Sharpness (Roughness)
```javascript
roughness: 0    // Architect mode (clean, precise)
roughness: 1    // Artist mode (hand-drawn, default)
roughness: 2    // Cartoonist mode (very sketchy)
```

### Examples
```javascript
// Clean technical diagram
ea.addRect(x, y, w, h, {
  strokeWidth: 1,
  strokeStyle: "solid",
  roughness: 0
});

// Sketchy whiteboard style
ea.addRect(x, y, w, h, {
  strokeWidth: 2,
  roughness: 2
});

// Dashed boundary
ea.addRect(x, y, w, h, {
  strokeStyle: "dashed",
  strokeWidth: 1
});
```

---

## Fill Styles

How the interior of shapes is rendered.

### Fill Options
```javascript
fillStyle: "hachure"      // Diagonal lines (default hand-drawn look)
fillStyle: "cross-hatch"  // Crossed diagonal lines
fillStyle: "solid"        // Solid color fill
```

### Visual Comparison
```
hachure:       cross-hatch:    solid:
  ╱╱╱╱╱╱         ╳╳╳╳╳╳         ██████
  ╱╱╱╱╱╱         ╳╳╳╳╳╳         ██████
  ╱╱╱╱╱╱         ╳╳╳╳╳╳         ██████
```

### Usage Guide
- **hachure**: Default, sketchy aesthetic
- **cross-hatch**: More texture, emphasis
- **solid**: Clean fills, flat design

### Examples
```javascript
// Light hachure fill
ea.addRect(x, y, w, h, {
  fillStyle: "hachure",
  backgroundColor: "#e0f7fa"
});

// Solid colored box
ea.addEllipse(x, y, w, h, {
  fillStyle: "solid",
  backgroundColor: "#4caf50"
});
```

---

## Arrow Styling

Special properties for arrows (directional connectors).

### Arrowhead Types
```javascript
startArrowhead: null        // No arrowhead
startArrowhead: "arrow"     // Standard arrow →
startArrowhead: "bar"       // Bar terminator |
startArrowhead: "dot"       // Dot terminator ●

endArrowhead: "arrow"       // Most common (end only)
```

### Arrowhead Combinations
```javascript
// One-way arrow (most common)
ea.addArrow([x1, y1], [x2, y2], {
  startArrowhead: null,
  endArrowhead: "arrow"
});

// Two-way arrow
ea.addArrow([x1, y1], [x2, y2], {
  startArrowhead: "arrow",
  endArrowhead: "arrow"
});

// Dot-to-arrow (relationship notation)
ea.addArrow([x1, y1], [x2, y2], {
  startArrowhead: "dot",
  endArrowhead: "arrow"
});

// Bar (terminator, no direction)
ea.addArrow([x1, y1], [x2, y2], {
  startArrowhead: "bar",
  endArrowhead: "bar"
});
```

---

## Typography

Text styling properties.

### Font Family
```javascript
fontFamily: 1    // Virgil (handwriting style, default)
fontFamily: 2    // Helvetica (sans-serif)
fontFamily: 3    // Cascadia (monospace, code)
```

### Font Size
```javascript
fontSize: 16     // Small
fontSize: 20     // Default
fontSize: 24     // Medium
fontSize: 32     // Large
fontSize: 48     // Extra large (titles)
```

### Text Alignment
```javascript
textAlign: "left"        // Left-aligned
textAlign: "center"      // Centered
textAlign: "right"       // Right-aligned

verticalAlign: "top"     // Top of box
verticalAlign: "middle"  // Centered vertically
```

### Examples
```javascript
// Title text
ea.addText(x, y, "System Architecture", {
  fontSize: 32,
  fontFamily: 2,  // Helvetica
  textAlign: "center"
});

// Code snippet
ea.addText(x, y, "function() { ... }", {
  fontSize: 16,
  fontFamily: 3,  // Cascadia monospace
  strokeColor: "#757575"
});

// Handwritten note
ea.addText(x, y, "Important!", {
  fontSize: 24,
  fontFamily: 1,  // Virgil handwriting
  strokeColor: "#f44336"
});
```

---

## Opacity & Effects

### Opacity
```javascript
opacity: 100    // Fully opaque (default)
opacity: 50     // Semi-transparent
opacity: 0      // Fully transparent (hidden)
```

**Use cases:**
- Backgrounds: `opacity: 30` for subtle shading
- Watermarks: `opacity: 20` for faint overlays
- Highlights: `opacity: 60` for emphasis without blocking content

### Example
```javascript
// Semi-transparent background box
ea.addRect(x, y, w, h, {
  fillStyle: "solid",
  backgroundColor: "#ffc107",
  opacity: 30
});
```

---

## Roundness

For rectangles only - creates rounded corners.

### Roundness Values
```javascript
roundness: null              // Sharp corners (default)
roundness: {type: 3}         // Rounded corners
```

**Note:** The `type` value typically stays at `3`. The visual roundness is determined by the element's dimensions.

### Example
```javascript
// Rounded rectangle
ea.addRect(x, y, w, h, {
  roundness: {type: 3},
  fillStyle: "solid",
  backgroundColor: "#e0f7fa"
});
```

---

## Complete Styling Example

Putting it all together:

```javascript
const ea = ExcalidrawAutomate.plugin;

// Clean technical diagram (architect mode)
ea.addRect(100, 100, 200, 100, {
  text: "API Server",
  strokeColor: "#1e90ff",
  backgroundColor: "#e0f7fa",
  fillStyle: "solid",
  strokeWidth: 2,
  roughness: 0,
  roundness: {type: 3},
  fontSize: 20,
  fontFamily: 2  // Helvetica
});

// Sketchy whiteboard style
ea.addEllipse(400, 150, 180, 120, {
  text: "User",
  strokeColor: "#4caf50",
  backgroundColor: "#ffffff",
  fillStyle: "hachure",
  strokeWidth: 2,
  roughness: 2,  // Very sketchy
  fontSize: 24,
  fontFamily: 1  // Handwriting
});

// Connection arrow
ea.addArrow([300, 150], [400, 150], {
  strokeColor: "#757575",
  strokeWidth: 2,
  endArrowhead: "arrow",
  roughness: 1
});

ea.create();
```

---

## Style Consistency Tips

1. **Pick a roughness level and stick to it** (0 for technical, 1-2 for sketches)
2. **Use a limited color palette** (3-5 colors max for clarity)
3. **Match stroke width to element importance** (titles: 4, normal: 2, details: 1)
4. **Solid fills for emphasis**, hachure for secondary elements
5. **Font family consistency**: Use one primary font per diagram
