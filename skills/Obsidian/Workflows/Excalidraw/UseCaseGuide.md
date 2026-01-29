# Use Case Guide

This document helps you select the right diagram pattern based on what the user asked for. Scan the prompt for keywords, then follow the pattern for that diagram type.

---

## Pattern Selection

### Step 1: Identify keywords in the prompt

Read the user's request and find the matching category:

| The prompt mentions... | You will create... | Using... | With roughness... |
|------------------------|--------------------| ---------|-------------------|
| architecture, system, components, services, infrastructure | Architecture diagram | Rectangles (services) + Ellipses (databases) | 0 |
| flow, process, workflow, steps, sequence, pipeline | Flowchart | Rectangles (actions) + Diamonds (decisions) | 0-1 |
| brainstorm, ideas, sketch, whiteboard, thinking | Whiteboard sketch | Ellipses + Freedraw + Lines | 2 |
| concept, mind map, relationships, connections | Mind map | Sized ellipses in radial layout | 1-2 |
| presentation, slides, deck, talk | Presentation | Frames containing content groups | 0 |
| network, database, technical, schema, server | Technical diagram | Rectangles + Icons/Images | 0 |
| UI, mockup, wireframe, screen, interface | UI mockup | Rounded rectangles in device frames | 0-1 |
| data flow, ETL, pipeline, transformation | Data flow | Ellipses (sources) → Rectangles (processes) | 0-1 |

**When keywords are unclear:** Default to Architecture pattern with roughness 1.

### Step 2: Apply the shape grammar

Each diagram type has a visual grammar—shapes have specific meanings:

| Diagram Type | Shape | Means |
|--------------|-------|-------|
| **Architecture** | Rectangle | Service, component, module |
| | Ellipse | Database, data store |
| | Arrow | Data flow, dependency |
| **Flowchart** | Rectangle | Action, process step |
| | Diamond | Decision point |
| | Ellipse | Start/End |
| | Arrow | Flow direction |
| **Mind Map** | Large ellipse (center) | Main concept |
| | Medium ellipse | Primary branches |
| | Small ellipse | Sub-branches |
| | Line (no arrow) | Relationship |
| **Data Flow** | Ellipse | External entity |
| | Rectangle | Process |
| | Open rectangle | Data store |
| | Arrow | Data movement |

### Step 3: Choose layout direction

| Diagram Type | Arrange elements... | Because... |
|--------------|---------------------|------------|
| Architecture | Left→right in horizontal layers | Matches data flow direction |
| Flowchart | Top→bottom | Natural reading flow |
| Mind Map | Radial from center | Emphasizes central concept |
| Presentation | Sequential frames | Slide-by-slide progression |
| Technical | Grid-based | Shows system topology |
| UI/UX | Within device frames | Represents actual screens |
| Data Flow | Left→right | Matches transformation pipeline |
| Whiteboard | Organic clusters | Mirrors natural brainstorming |

---

## Excalidraw vs Mermaid

```
Need a diagram?
│
├─ Is it structured/code-based? ────────────→ USE MERMAID
│  (flowchart, sequence, ER, class, etc.)
│
├─ Need version control in markdown? ───────→ USE MERMAID
│
├─ Need automated/programmatic generation? ─→ BOTH OK
│  (Mermaid easier, Excalidraw more flexible)
│
├─ Need freeform/hand-drawn aesthetic? ─────→ USE EXCALIDRAW
│
├─ Need pixel-perfect positioning? ─────────→ USE EXCALIDRAW
│
├─ Need custom visual styles? ──────────────→ USE EXCALIDRAW
│
└─ Sketching/brainstorming? ────────────────→ USE EXCALIDRAW
```

---

## Architecture Diagrams

**When to use Excalidraw:**
- Custom component layouts
- Multi-layer architectures (frontend, backend, data)
- Cloud architecture with icons/images
- Precise positioning needed

**Pattern:**
```javascript
// Boxes for components + arrows for data flow
const frontend = ea.addRect(50, 100, 200, 100, {
  text: "Frontend\nReact",
  fillStyle: "solid",
  backgroundColor: "#e3f2fd",
  roughness: 0  // Clean technical look
});

const api = ea.addRect(350, 100, 200, 100, {
  text: "Backend API\nNode.js",
  fillStyle: "solid",
  backgroundColor: "#fff9c4",
  roughness: 0
});

const db = ea.addEllipse(500, 300, 180, 100, {
  text: "PostgreSQL",
  fillStyle: "solid",
  backgroundColor: "#c8e6c9"
});

// Data flow arrows
ea.addArrow([[250, 150], [350, 150]], {
  endArrowhead: "arrow",
  text: "REST API"
});
```

**Best practices:**
- Use rectangles for services/components
- Use ellipses for databases
- Use solid fills for clean look (roughness: 0)
- Label arrows with protocols/technologies
- Group by architectural layer (horizontal grouping)

---

## User Flows & Journeys

**When to use Excalidraw:**
- Custom user journey maps
- Non-linear flows (multiple paths)
- Visual emphasis on specific steps

**Pattern:**
```javascript
// Diamond for decisions, rectangles for actions
const start = ea.addEllipse(100, 100, 120, 80, {
  text: "Start",
  fillStyle: "solid"
});

const decision = ea.addDiamond(300, 100, 150, 100, {
  text: "Logged in?",
  backgroundColor: "#fff9c4"
});

const actionYes = ea.addRect(500, 50, 180, 80, {
  text: "Dashboard"
});

const actionNo = ea.addRect(500, 150, 180, 80, {
  text: "Login Page"
});

// Decision arrows
ea.addArrow([[220, 100], [300, 100]], {endArrowhead: "arrow"});
ea.addArrow([[375, 70], [500, 70]], {
  endArrowhead: "arrow",
  text: "Yes"
});
ea.addArrow([[375, 130], [500, 170]], {
  endArrowhead: "arrow",
  text: "No"
});
```

**Best practices:**
- Ellipses for start/end points
- Diamonds for decision points
- Rectangles for actions/screens
- Label decision arrows with conditions
- Use color to highlight critical paths

**When to use Mermaid instead:**
- Simple linear flows
- Standard flowchart notation
- Version-controlled documentation

---

## Whiteboard Brainstorming

**When to use Excalidraw:**
- Always. This is Excalidraw's sweet spot.

**Pattern:**
```javascript
// Freeform elements + rough aesthetic
ea.addEllipse(100, 100, 150, 100, {
  text: "Core Idea",
  roughness: 2,  // Very sketchy
  fillStyle: "hachure"
});

// Surrounding related concepts
ea.addEllipse(300, 80, 120, 80, {text: "Feature A"});
ea.addEllipse(280, 180, 140, 90, {text: "Feature B"});

// Connecting lines (not arrows - just associations)
ea.addLine([[175, 100], [300, 90]], {strokeStyle: "dashed"});
ea.addLine([[180, 130], [290, 180]]);

// Hand-drawn annotations
ea.addFreedraw([[50, 50], [60, 55], [70, 48]], {
  strokeColor: "#ff6b6b",
  strokeWidth: 2
});
```

**Best practices:**
- High roughness (1-2) for sketchy feel
- Use hachure fill style
- Mix shapes (ellipses, rectangles, freedraw)
- Add images/screenshots for context
- Don't worry about perfect alignment

---

## Concept Maps & Mind Maps

**When to use Excalidraw:**
- Custom layouts (not standard tree structure)
- Visual hierarchy with varying sizes
- Images and icons needed

**Pattern:**
```javascript
// Central concept (large)
const center = ea.addEllipse(400, 300, 200, 120, {
  text: "Project",
  fontSize: 24,
  fillStyle: "solid",
  backgroundColor: "#e3f2fd"
});

// Branches (medium)
const branch1 = ea.addEllipse(150, 150, 150, 90, {
  text: "Goals",
  backgroundColor: "#c8e6c9"
});

const branch2 = ea.addEllipse(650, 150, 150, 90, {
  text: "Risks"
});

// Sub-branches (small)
const sub1 = ea.addEllipse(100, 50, 100, 60, {
  text: "Revenue",
  fontSize: 16
});

// Connecting lines (no arrows - just relationships)
ea.addLine([[300, 270], [220, 200]]);
ea.addLine([[500, 270], [650, 200]]);
ea.addLine([[170, 120], [130, 80]]);
```

**Best practices:**
- Vary element sizes by importance (central > branch > sub-branch)
- Use lines (not arrows) for non-directional relationships
- Use color to group related concepts
- Radial or organic layouts (not grid-based)

**When to use Mermaid instead:**
- Standard hierarchical mind map
- Automated generation from data

---

## Presentations & Slides

**When to use Excalidraw:**
- Visual presentations with diagrams
- Sequential content reveal
- Embedded in Obsidian notes

**Pattern:**
```javascript
// Slide 1: Title
const frame1 = ea.addFrame(0, 0, 800, 600, {
  name: "Slide 1: Introduction"
});
ea.addText(250, 250, "Project Kickoff", {
  fontSize: 48,
  fontFamily: 2  // Helvetica
});

// Slide 2: Content
const frame2 = ea.addFrame(850, 0, 800, 600, {
  name: "Slide 2: Architecture"
});
// Add diagram elements inside frame2 bounds
ea.addRect(900, 100, 200, 100, {text: "Component A"});
```

**Navigation:**
- Use arrow keys to move between frames
- Embed specific frames: `![[presentation.excalidraw#^slide1]]`

**Best practices:**
- One frame per slide
- Use solid fills and clean lines (roughness: 0)
- Large fonts (32-48px for titles, 20-24px for body)
- High contrast colors
- Export frames as individual images if needed

---

## Technical Diagrams (Network, DB, System)

**When to use Excalidraw:**
- Custom network topologies
- Database schema with custom layout
- System diagrams with icons/images

**Pattern:**
```javascript
// Clean, technical style
const server1 = ea.addRect(100, 100, 150, 100, {
  text: "Server 1\n192.168.1.10",
  fillStyle: "solid",
  roughness: 0,  // No sketch effect
  strokeWidth: 2,
  backgroundColor: "#e0e0e0"
});

const server2 = ea.addRect(350, 100, 150, 100, {
  text: "Server 2\n192.168.1.11",
  fillStyle: "solid",
  roughness: 0,
  strokeWidth: 2,
  backgroundColor: "#e0e0e0"
});

// Network connection (dashed line for logical connection)
ea.addLine([[250, 150], [350, 150]], {
  strokeStyle: "dashed",
  strokeWidth: 1,
  strokeColor: "#1e90ff"
});

// Add firewall icon/image
const firewall = await ea.addImage(300, 200, firewallIcon);
```

**Best practices:**
- Roughness: 0 (architect mode)
- Solid fills or no fill
- Use dashed lines for logical connections, solid for physical
- Label with IP addresses, ports, protocols
- Add icons/images for hardware (servers, routers, firewalls)

**When to use Mermaid instead:**
- Entity-relationship diagrams (ER syntax)
- Class diagrams (UML syntax)
- Simple block diagrams

---

## UI/UX Mockups

**When to use Excalidraw:**
- Low-fidelity wireframes
- Quick mockup iterations
- Annotated screenshots

**Pattern:**
```javascript
// Mobile frame
const phone = ea.addRect(200, 50, 300, 600, {
  strokeWidth: 4,
  roundness: {type: 3},  // Rounded corners
  fillStyle: "solid",
  backgroundColor: "#ffffff"
});

// Header
ea.addRect(220, 70, 260, 60, {
  text: "App Title",
  backgroundColor: "#1e90ff",
  fillStyle: "solid"
});

// Button
ea.addRect(250, 500, 200, 50, {
  text: "Submit",
  backgroundColor: "#4caf50",
  fillStyle: "solid",
  roundness: {type: 3}
});

// Annotations (outside frame)
ea.addArrow([[480, 120], [550, 120]], {endArrowhead: "arrow"});
ea.addText(560, 110, "Navigation bar", {fontSize: 16});
```

**Best practices:**
- Use rounded rectangles for buttons/cards
- Grayscale for low-fidelity, color for high-fidelity
- Add annotations with arrows pointing to features
- Embed screenshots for reference
- Use frames for different screens

---

## Data Flow Diagrams

**When to use Excalidraw:**
- Complex data flows with custom routing
- Multi-system data flows
- Visual emphasis on data transformations

**Pattern:**
```javascript
// Data source
const source = ea.addEllipse(100, 200, 120, 80, {
  text: "User Input",
  fillStyle: "solid"
});

// Processing stages
const process1 = ea.addRect(300, 180, 180, 100, {
  text: "Validate",
  backgroundColor: "#fff9c4"
});

const process2 = ea.addRect(550, 180, 180, 100, {
  text: "Transform",
  backgroundColor: "#e0f7fa"
});

// Data store
const db = ea.addRect(800, 180, 120, 100, {
  text: "Store",
  backgroundColor: "#c8e6c9"
});

// Data flow arrows (label with data types)
ea.addArrow([[160, 200], [300, 200]], {
  endArrowhead: "arrow",
  text: "JSON"
});

ea.addArrow([[480, 200], [550, 200]], {
  endArrowhead: "arrow",
  text: "DTO"
});
```

**Best practices:**
- Ellipses for external entities
- Rectangles for processes
- Parallel rectangles for data stores
- Label arrows with data types/formats
- Use color to distinguish stages

**When to use Mermaid instead:**
- Standard DFD notation required
- Automated generation from data

---

## Comparison: When to Choose What

| Use Case | Excalidraw | Mermaid |
|----------|------------|---------|
| **Freeform sketches** | ✅ Always | ❌ Not suited |
| **Structured flowcharts** | ⚠️ OK | ✅ Better |
| **Architecture diagrams** | ✅ Custom layouts | ⚠️ Limited icons |
| **Sequence diagrams** | ⚠️ Manual effort | ✅ Auto-layout |
| **ER diagrams** | ⚠️ Manual effort | ✅ Purpose-built |
| **Mind maps** | ✅ Custom layouts | ✅ Standard layouts |
| **Presentations** | ✅ Frames | ❌ Not suited |
| **Whiteboard brainstorm** | ✅ Natural fit | ❌ Not suited |
| **Version control** | ⚠️ JSON (ok) | ✅ Markdown (best) |
| **Pixel-perfect control** | ✅ Full control | ❌ Auto-layout only |
| **Hand-drawn aesthetic** | ✅ Built-in | ❌ Not available |
| **Automated generation** | ⚠️ API available | ✅ Easier |

---

## Summary: Choosing the Right Tool

**Choose Excalidraw when:**
- You need freeform, creative control
- Hand-drawn aesthetic is desired
- Pixel-perfect positioning matters
- Adding images, icons, or custom graphics
- Creating presentations with frames
- Brainstorming or whiteboarding

**Choose Mermaid when:**
- Structured, standard diagram types (flowchart, sequence, ER)
- Diagram lives in markdown (version control)
- Automated generation from data
- Consistent, reproducible layouts
- Text-based editing preferred

**Use both:**
- Start with Excalidraw sketches, refine to Mermaid diagrams
- High-level architecture in Excalidraw, detailed flows in Mermaid
- Presentations in Excalidraw, documentation diagrams in Mermaid
