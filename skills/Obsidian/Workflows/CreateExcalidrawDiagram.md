# CreateExcalidrawDiagram Workflow

> **Trigger:** "create excalidraw", "draw diagram", "sketch this"

## Purpose

Programmatically generate Excalidraw diagrams based on user description.

## Steps

### Step 1: Load Reference Documentation

Load relevant Excalidraw documentation based on diagram type:

**Always load:**
- `workflows/Excalidraw/CoreConcepts.md` - Element structure, canvas model
- `workflows/Excalidraw/AutomateAPI.md` - API methods for creation

**Load as needed:**
- `workflows/Excalidraw/StylingSystem.md` - If custom styling requested
- `workflows/Excalidraw/UseCaseGuide.md` - For diagram pattern guidance
- `workflows/Excalidraw/ElementTypes.md` - For specific element details

### Step 2: Determine Diagram Type

Analyze user request to identify diagram type:

| User Request Pattern | Diagram Type | Primary Elements |
|----------------------|--------------|------------------|
| "architecture", "system", "components" | **Architecture** | Rectangles + arrows |
| "flow", "process", "workflow" | **Flowchart** | Shapes + decision diamonds |
| "sketch", "brainstorm", "whiteboard" | **Sketch** | Freeform + rough aesthetic |
| "presentation", "slides" | **Presentation** | Frames + grouped content |
| "user journey", "path", "steps" | **User Flow** | Sequential boxes + arrows |
| "concept map", "mind map" | **Mind Map** | Ellipses + connecting lines |

### Step 3: Generate Diagram Code

Create JavaScript using ExcalidrawAutomate API:

#### Architecture Diagram Template
```javascript
const ea = ExcalidrawAutomate.plugin;
ea.clear();

// Components (boxes)
const frontend = ea.addRect(50, 100, 200, 100, {
  text: "Frontend\n[Framework]",
  fillStyle: "solid",
  backgroundColor: "#e3f2fd",
  roughness: 0
});

const backend = ea.addRect(350, 100, 200, 100, {
  text: "Backend\n[Technology]",
  fillStyle: "solid",
  backgroundColor: "#fff9c4",
  roughness: 0
});

const database = ea.addEllipse(500, 300, 180, 100, {
  text: "Database",
  fillStyle: "solid",
  backgroundColor: "#c8e6c9"
});

// Connections
ea.addArrow([[250, 150], [350, 150]], {
  endArrowhead: "arrow",
  strokeWidth: 2,
  text: "API"
});

ea.addArrow([[450, 200], [450, 250]], {
  endArrowhead: "arrow",
  strokeWidth: 2
});

// Title
ea.addText(200, 20, "System Architecture", {
  fontSize: 32,
  fontFamily: 2  // Helvetica
});

await ea.create("[DiagramName]", "Diagrams/");
```

#### Flowchart Template
```javascript
const ea = ExcalidrawAutomate.plugin;
ea.clear();

const steps = ["Start", "Process", "Decision?", "Action", "End"];
const yStart = 100;
const yGap = 150;
const x = 300;

steps.forEach((step, i) => {
  const y = yStart + (i * yGap);

  if (step.includes("?")) {
    // Decision diamond
    ea.addDiamond(x, y, 200, 100, {
      text: step,
      backgroundColor: "#fff9c4"
    });
  } else if (step === "Start" || step === "End") {
    // Start/end ellipse
    ea.addEllipse(x, y, 180, 80, {
      text: step,
      fillStyle: "solid",
      backgroundColor: "#e0e0e0"
    });
  } else {
    // Process rectangle
    ea.addRect(x - 100, y - 40, 200, 80, {
      text: step
    });
  }

  // Connect to next step
  if (i < steps.length - 1) {
    ea.addArrow(
      [[x, y + 40], [x, yStart + ((i + 1) * yGap) - 40]],
      {endArrowhead: "arrow"}
    );
  }
});

await ea.create("[DiagramName]", "Diagrams/");
```

#### Sketch/Brainstorm Template
```javascript
const ea = ExcalidrawAutomate.plugin;
ea.clear();

// Central idea (large, sketchy)
ea.addEllipse(400, 300, 200, 120, {
  text: "Central Idea",
  fontSize: 24,
  roughness: 2,  // Very sketchy
  fillStyle: "hachure"
});

// Surrounding concepts
const branches = ["Concept A", "Concept B", "Concept C", "Concept D"];
const radius = 200;

branches.forEach((branch, i) => {
  const angle = (Math.PI * 2 * i) / branches.length;
  const x = 400 + Math.cos(angle) * radius;
  const y = 300 + Math.sin(angle) * radius;

  ea.addEllipse(x, y, 140, 90, {
    text: branch,
    roughness: 2,
    fillStyle: "hachure"
  });

  // Connecting lines
  ea.addLine([[400, 300], [x, y]], {
    strokeStyle: "solid",
    strokeWidth: 2
  });
});

await ea.create("[DiagramName]", "Diagrams/");
```

### Step 4: Execute Diagram Creation

**Option A: Direct Execution (Obsidian with ExcalidrawAutomate)**

If ExcalidrawAutomate is available:
```bash
# Write script to temporary file
Write-File "temp_excalidraw_script.js" with generated code

# Execute via Obsidian (if scripting enabled)
# This step depends on Obsidian plugin API access
```

**Option B: Manual File Creation (Always Works)**

Create the `.excalidraw` file directly as JSON:
```javascript
const diagramJSON = {
  type: "excalidraw",
  version: 2,
  source: "https://excalidraw.com",
  elements: [
    // Generated elements
  ],
  appState: {
    viewBackgroundColor: "#ffffff"
  },
  files: {}
};

// Write to file
const filePath = "C:\\Users\\fujos\\Obsidian\\Diagrams\\[name].excalidraw";
const content = `---\nexcalidraw-plugin: parsed\n---\n${JSON.stringify(diagramJSON, null, 2)}`;
```

### Step 5: Save to Vault

Determine file path and save:

```bash
# Default location
VAULT_PATH="C:\Users\fujos\Obsidian"
DIAGRAM_FOLDER="Diagrams"

# Determine diagram type subfolder
# Architecture → Diagrams/Architecture/
# Flows → Diagrams/Flows/
# Sketches → Diagrams/Sketches/

# Generate filename from description
FILENAME="[descriptive-name].excalidraw"

# Full path
FULL_PATH="$VAULT_PATH/$DIAGRAM_FOLDER/[subfolder]/$FILENAME"

# Write file with frontmatter
```

### Step 6: Confirm and Return

Report to user:
```
CREATED: Diagrams/Architecture/SystemOverview.excalidraw
ELEMENTS: 5 rectangles, 3 arrows, 1 text
EMBED: ![[SystemOverview.excalidraw]]
SIZE: 800x600px canvas area
```

Provide embedding syntax for immediate use.

## Example Outputs

### Example 1: Architecture Diagram
```
User: "Create an architecture diagram for a web app with frontend, backend, and database"

→ Loads: CoreConcepts.md, AutomateAPI.md
→ Diagram Type: Architecture
→ Generates: 3 components (rectangles), 2 connections (arrows), 1 title
→ Saves: Diagrams/Architecture/WebAppArchitecture.excalidraw

CREATED: Diagrams/Architecture/WebAppArchitecture.excalidraw
ELEMENTS: 3 components, 2 arrows, 1 title
EMBED: ![[WebAppArchitecture.excalidraw]]
```

### Example 2: User Flow
```
User: "Draw a user login flow with decision for authentication"

→ Loads: CoreConcepts.md, AutomateAPI.md, UseCaseGuide.md
→ Diagram Type: Flowchart (User Flow)
→ Generates: 5 steps (ellipses, rectangles, diamond), 4 arrows
→ Saves: Diagrams/Flows/LoginFlow.excalidraw

CREATED: Diagrams/Flows/LoginFlow.excalidraw
ELEMENTS: 1 start, 1 decision, 2 actions, 1 end, 4 arrows
EMBED: ![[LoginFlow.excalidraw|400]]
```

### Example 3: Brainstorm Sketch
```
User: "Create a mind map for project planning"

→ Loads: CoreConcepts.md, AutomateAPI.md, UseCaseGuide.md
→ Diagram Type: Mind Map
→ Generates: 1 center, 4 branches, connecting lines, sketchy style
→ Saves: Diagrams/Sketches/ProjectPlanning.excalidraw

CREATED: Diagrams/Sketches/ProjectPlanning.excalidraw
ELEMENTS: 5 ellipses (center + 4 branches), 4 lines
STYLE: Sketchy (roughness: 2)
EMBED: ![[ProjectPlanning.excalidraw]]
```

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| **ExcalidrawAutomate not found** | Plugin not installed | Use manual JSON creation (Option B) |
| **Invalid element properties** | Incorrect API usage | Refer to AutomateAPI.md for correct syntax |
| **File write failed** | Permissions or path issue | Verify vault path, check permissions |
| **Empty diagram generated** | No elements created | Check diagram generation logic |

## Best Practices

1. **Always clear canvas** with `ea.clear()` before generating
2. **Use consistent spacing** (50-100px between elements)
3. **Set roughness appropriately** (0 for technical, 1-2 for sketches)
4. **Label connections** with text property on arrows
5. **Add title text** for clarity (fontSize: 32, fontFamily: 2)
6. **Group related elements** for easier manipulation
7. **Use frames** for presentation-style diagrams
8. **Add frontmatter** with `excalidraw-plugin: parsed` for linter compatibility

## Voice Notification

When executing this workflow:
```bash
curl -s -X POST ${VOICE_SERVER_URL}/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the CreateExcalidrawDiagram workflow from the Obsidian skill"}' \
  > /dev/null 2>&1 &
```

And output:
```
Running the **CreateExcalidrawDiagram** workflow from the **Obsidian** skill...
```
