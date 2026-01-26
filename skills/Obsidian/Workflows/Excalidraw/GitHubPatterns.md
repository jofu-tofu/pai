# GitHub Patterns

Implementation patterns from 10+ GitHub repositories and community research.

---

## Pattern 1: Two-Layer Architecture (Canvas/UI + Protocol/API)

**Source:** `yctimlin/mcp_excalidraw`

**Concept:**
Separate the **visual layer** (Excalidraw UI) from the **logic layer** (API/protocol).

```
┌─────────────────────┐
│   UI Layer          │  Excalidraw canvas, user interactions
│   (Canvas)          │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   Protocol Layer    │  API, data transformations, business logic
│   (API/MCP)         │
└─────────────────────┘
```

**Implementation:**
```javascript
// Protocol layer: Define operations
class ExcalidrawProtocol {
  createElement(type, properties) {
    return {
      id: generateId(),
      type: type,
      ...properties
    };
  }

  connectElements(arrowId, targetId, endpoint) {
    // Binding logic
  }
}

// UI layer: Interact with protocol
const protocol = new ExcalidrawProtocol();
const element = protocol.createElement('rectangle', {x: 100, y: 100});
excalidrawAPI.updateScene([element]);
```

**Benefits:**
- Decouples business logic from UI
- Testable without rendering
- Easier to extend with new operations
- Can swap UI implementations

**Use when:**
- Building Excalidraw integrations
- Need programmatic control over diagrams
- Automating diagram generation

---

## Pattern 2: Auto-Layout Algorithms (Flowchart, Hierarchy, Mind Map)

**Source:** `robtaylor/excalidraw-diagrams`

**Concept:**
Automatically position elements based on diagram type.

### Flowchart Layout (Vertical)
```javascript
function layoutFlowchart(steps) {
  const startX = 300;
  const startY = 100;
  const verticalGap = 150;

  steps.forEach((step, i) => {
    const y = startY + (i * verticalGap);
    const element = ea.addRect(startX, y, 200, 80, {text: step});

    // Connect to previous step
    if (i > 0) {
      ea.addArrow(
        [[startX + 100, y - verticalGap + 80], [startX + 100, y]],
        {endArrowhead: "arrow"}
      );
    }
  });
}

// Usage
layoutFlowchart(["Start", "Process", "Decision", "End"]);
```

### Hierarchical Layout (Tree)
```javascript
function layoutTree(root, depth = 0, x = 400, y = 50) {
  const horizontalGap = 200;
  const verticalGap = 150;

  // Create current node
  const nodeId = ea.addEllipse(x, y, 120, 80, {text: root.label});

  // Position children
  if (root.children && root.children.length > 0) {
    const totalWidth = root.children.length * horizontalGap;
    const startX = x - (totalWidth / 2) + (horizontalGap / 2);

    root.children.forEach((child, i) => {
      const childX = startX + (i * horizontalGap);
      const childY = y + verticalGap;

      const childId = layoutTree(child, depth + 1, childX, childY);

      // Connect parent to child
      ea.addArrow([[x, y + 40], [childX, childY - 40]], {
        endArrowhead: "arrow"
      });
    });
  }

  return nodeId;
}

// Usage
const tree = {
  label: "Root",
  children: [
    {label: "Child 1", children: []},
    {label: "Child 2", children: []},
    {label: "Child 3", children: []}
  ]
};
layoutTree(tree);
```

### Mind Map Layout (Radial)
```javascript
function layoutMindMap(center, branches) {
  const centerX = 400;
  const centerY = 300;
  const radius = 200;

  // Central concept
  ea.addEllipse(centerX, centerY, 180, 120, {
    text: center,
    fontSize: 24,
    fillStyle: "solid"
  });

  // Distribute branches radially
  branches.forEach((branch, i) => {
    const angle = (Math.PI * 2 * i) / branches.length;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    ea.addEllipse(x, y, 140, 90, {text: branch});
    ea.addLine([[centerX, centerY], [x, y]]);
  });
}

// Usage
layoutMindMap("Project", ["Goals", "Risks", "Timeline", "Resources"]);
```

**Benefits:**
- Consistent layouts
- Rapid diagram generation
- Reduces manual positioning

**Use when:**
- Generating diagrams from data
- Need reproducible layouts
- Automating documentation

---

## Pattern 3: Incremental Updates (Real-time Collaboration)

**Source:** `lesleslie/excalidraw-mcp`

**Concept:**
Update diagrams incrementally without recreating entire scene.

```javascript
class IncrementalUpdater {
  constructor(existingElements) {
    this.elements = new Map(existingElements.map(e => [e.id, e]));
  }

  addElement(element) {
    this.elements.set(element.id, element);
    return this.getUpdatedElements();
  }

  updateElement(id, changes) {
    const existing = this.elements.get(id);
    if (existing) {
      this.elements.set(id, {...existing, ...changes});
    }
    return this.getUpdatedElements();
  }

  deleteElement(id) {
    this.elements.delete(id);
    return this.getUpdatedElements();
  }

  getUpdatedElements() {
    return Array.from(this.elements.values());
  }
}

// Usage
const updater = new IncrementalUpdater(ea.getElements());
updater.addElement({id: "new-1", type: "rectangle", x: 100, y: 100});
updater.updateElement("existing-1", {x: 200, y: 200});
ea.updateScene(updater.getUpdatedElements());
```

**Benefits:**
- Efficient updates (no full redraw)
- Supports real-time collaboration
- Preserves element state

**Use when:**
- Building collaborative tools
- Live diagram updates from data
- Performance-critical applications

---

## Pattern 4: Template Systems (Reusable Diagrams)

**Source:** `axtonliu/axton-obsidian-visual-skills`

**Concept:**
Create template functions for common diagram patterns.

```javascript
// Template library
const templates = {
  threeBoxArchitecture: (labels) => {
    ea.clear();
    ea.addRect(50, 100, 200, 100, {text: labels.frontend || "Frontend"});
    ea.addRect(350, 100, 200, 100, {text: labels.backend || "Backend"});
    ea.addRect(650, 100, 200, 100, {text: labels.database || "Database"});

    ea.addArrow([[250, 150], [350, 150]], {endArrowhead: "arrow"});
    ea.addArrow([[550, 150], [650, 150]], {endArrowhead: "arrow"});

    ea.create("ThreeBoxArchitecture", "Diagrams/");
  },

  decisionFlow: (question, yesAction, noAction) => {
    ea.clear();
    const decision = ea.addDiamond(300, 100, 200, 120, {text: question});
    const yes = ea.addRect(150, 300, 180, 80, {text: yesAction});
    const no = ea.addRect(450, 300, 180, 80, {text: noAction});

    ea.addArrow([[300, 160], [240, 300]], {
      endArrowhead: "arrow",
      text: "Yes"
    });
    ea.addArrow([[400, 160], [540, 300]], {
      endArrowhead: "arrow",
      text: "No"
    });

    ea.create("DecisionFlow", "Diagrams/");
  },

  userJourney: (steps) => {
    ea.clear();
    const startX = 100;
    const stepWidth = 150;
    const gap = 50;

    steps.forEach((step, i) => {
      const x = startX + (i * (stepWidth + gap));
      ea.addRect(x, 150, stepWidth, 100, {
        text: `${i + 1}. ${step}`,
        fillStyle: "solid"
      });

      if (i < steps.length - 1) {
        ea.addArrow(
          [[x + stepWidth, 200], [x + stepWidth + gap, 200]],
          {endArrowhead: "arrow"}
        );
      }
    });

    ea.create("UserJourney", "Diagrams/");
  }
};

// Usage
templates.threeBoxArchitecture({
  frontend: "React",
  backend: "Node.js",
  database: "PostgreSQL"
});

templates.decisionFlow("Logged in?", "Dashboard", "Login Page");

templates.userJourney(["Browse", "Add to Cart", "Checkout", "Confirm"]);
```

**Benefits:**
- Rapid diagram creation
- Consistency across diagrams
- Reduces boilerplate code

**Use when:**
- Repeated diagram patterns
- Team needs consistent diagrams
- Onboarding new users

---

## Pattern 5: Skill Portability (Cross-Platform Skills)

**Source:** `rnjn/cc-excalidraw-skill`

**Concept:**
Create skills that work across multiple AI tools (Claude Code, Cursor, Windsurf).

```markdown
# Excalidraw Skill (Portable)

## Capabilities
- Works in: Claude Code, Cursor, Windsurf
- Dependencies: Obsidian-Excalidraw plugin
- API: ExcalidrawAutomate

## Universal Commands
1. **Create diagram**: Generates .excalidraw file
2. **Update diagram**: Modifies existing diagram
3. **Export diagram**: PNG/SVG export

## Implementation
```javascript
// Detect environment
const isClaudeCode = typeof ClaudeCode !== 'undefined';
const isCursor = typeof Cursor !== 'undefined';
const isWindsurf = typeof Windsurf !== 'undefined';

// Universal diagram creation function
async function createDiagram(config) {
  const ea = ExcalidrawAutomate.plugin;
  ea.clear();

  // Build diagram from config
  config.elements.forEach(el => {
    switch (el.type) {
      case 'rect':
        ea.addRect(el.x, el.y, el.w, el.h, el.options);
        break;
      case 'arrow':
        ea.addArrow(el.points, el.options);
        break;
      // ... other types
    }
  });

  // Save (environment-agnostic)
  await ea.create(config.filename, config.folder);

  return {
    success: true,
    path: `${config.folder}/${config.filename}.excalidraw`
  };
}
```

**Benefits:**
- Skills work across tools
- No vendor lock-in
- Reusable code

**Use when:**
- Building portable skills
- Supporting multiple AI tools
- Want flexibility in tooling

---

## Pattern 6: Data-Driven Diagrams (JSON → Excalidraw)

**Concept:**
Generate diagrams from structured data.

```javascript
function diagramFromJSON(data) {
  ea.clear();

  data.nodes.forEach(node => {
    ea.addRect(node.x, node.y, node.width, node.height, {
      text: node.label,
      backgroundColor: node.color || "#ffffff"
    });
  });

  data.edges.forEach(edge => {
    const from = data.nodes.find(n => n.id === edge.from);
    const to = data.nodes.find(n => n.id === edge.to);

    ea.addArrow(
      [[from.x + from.width, from.y + from.height / 2],
       [to.x, to.y + to.height / 2]],
      {
        endArrowhead: "arrow",
        text: edge.label || ""
      }
    );
  });

  ea.create("DataDrivenDiagram", "Diagrams/");
}

// Usage
const data = {
  nodes: [
    {id: "a", x: 100, y: 100, width: 200, height: 100, label: "Service A"},
    {id: "b", x: 400, y: 100, width: 200, height: 100, label: "Service B"}
  ],
  edges: [
    {from: "a", to: "b", label: "API call"}
  ]
};
diagramFromJSON(data);
```

**Use when:**
- Generating diagrams from databases
- CI/CD pipeline diagrams
- Auto-documenting systems

---

## Pattern 7: State Management (Diagram Versioning)

**Concept:**
Track diagram state changes over time.

```javascript
class DiagramVersionControl {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
  }

  save(elements) {
    // Remove any redo history
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add new state
    this.history.push(JSON.parse(JSON.stringify(elements)));
    this.currentIndex++;
  }

  undo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return null;
  }

  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return null;
  }
}

// Usage
const vcs = new DiagramVersionControl();
vcs.save(ea.getElements());  // Save initial state
// ... make changes ...
vcs.save(ea.getElements());  // Save updated state
ea.updateScene(vcs.undo());  // Undo to previous state
```

**Use when:**
- Need undo/redo functionality
- Tracking diagram changes
- Collaborative editing

---

## Community Best Practices Summary

From analyzing GitHub implementations:

1. **Separate UI from logic** (Pattern 1) - Makes code testable and maintainable
2. **Use auto-layout algorithms** (Pattern 2) - Consistency and speed
3. **Incremental updates** (Pattern 3) - Performance and real-time collaboration
4. **Template libraries** (Pattern 4) - Reusability and consistency
5. **Portable skills** (Pattern 5) - Cross-platform compatibility
6. **Data-driven generation** (Pattern 6) - Automation and integration
7. **State management** (Pattern 7) - Versioning and undo functionality

**Key Insights:**
- ExcalidrawAutomate API is powerful for programmatic control
- JSON-based format enables version control and collaboration
- Separation of concerns (UI/logic) is critical for maintainability
- Template systems reduce repetitive work
- Auto-layout algorithms provide consistency

---

## Further Research

Explore these repositories for implementation details:
- **yctimlin/mcp_excalidraw** - MCP server architecture
- **robtaylor/excalidraw-diagrams** - Auto-layout algorithms
- **lesleslie/excalidraw-mcp** - Real-time updates
- **axtonliu/axton-obsidian-visual-skills** - Template library
- **rnjn/cc-excalidraw-skill** - Cross-platform skills
