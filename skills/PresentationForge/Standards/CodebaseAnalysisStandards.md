# Codebase Analysis Standards

> Used by: ReadabilityGate.md (when content type is codebase-analysis)
>
> Content-type-specific rules for codebase analysis documents.
> General readability rules are in ReadabilityStandards.md — those apply to ALL content types.
> This file contains ONLY rules specific to codebase analysis content.
>
> **Adding rules:** Codebase-analysis-specific rules go here. General rules go in ReadabilityStandards.md.
> Rule IDs are stable — never renumbered, only deprecated or appended.

---

## General Codebase Analysis (CA1–CA5)

### CA1: Boundary Identification
Codebase analysis must explicitly identify and visualize system boundaries: external vs. internal, public API surfaces, module/package boundaries, deployment boundaries.
- **Test:** Verify document contains at least one diagram showing system boundaries with labeled boundary lines or containment boxes.
- **Sources:** [C4 Model](https://c4model.com/)

### CA2: Data Flow with Type Annotations
Document must include at least one data flow diagram showing how data moves through the system. Arrows must be labeled with the actual type or interface being passed (e.g., `Promise<Deal>`, `CommandResult`, `string`), not abstract descriptions like "data" or "output."
- **Test:** Verify presence of a data flow diagram with directional arrows. Each arrow must show a concrete type name from the codebase, not a generic label.
- **Sources:** [Educative — Architecture Diagramming](https://www.educative.io/blog/software-architecture-diagramming-and-patterns)

### CA3: Dependency Direction
Dependency diagrams must clearly show dependency direction (who depends on whom). Circular dependencies must be explicitly called out.
- **Test:** Verify dependency diagrams use directional arrows. Check that circular dependencies are mentioned if present.
- **Sources:** [Lucidchart — Code Visualization](https://www.lucidchart.com/blog/visualize-code-documentation)

### CA4: Layer Identification
Document must identify and label the architectural layers (e.g., presentation, business logic, data access, infrastructure) and show how they relate.
- **Test:** Verify document contains a layer diagram or textual identification of layers.
- **Sources:** [Simon Brown — Visualize Architecture](https://academy.realm.io/posts/gotocph-simon-brown-visualize-document-explore-your-software-architecture/)

### CA5: Problem Callouts
Identified problems, risks, or architectural concerns must be visually distinct from descriptive content — using callout boxes, warning icons, or colored borders.
- **Test:** Verify findings/problems have distinct visual treatment separate from descriptive sections.
- **Sources:** Tufte's principle of graphical integrity

---

## Boundary Clarity (BC1–BC3)

### BC1: Named Boundaries
Each major component/module/service has a named boundary in at least one diagram.
- **Test:** Every component mentioned in text appears as a labeled boundary in a diagram.
- **Sources:** [C4 Model](https://c4model.com/)

### BC2: Internal vs External Distinction
Internal vs external dependencies are visually distinguished (different colors, line styles, or containment).
- **Test:** External systems/services use a visually distinct style from internal components.
- **Sources:** [C4 Model — Notation](https://c4model.com/diagrams/notation)

### BC3: Responsibility Summaries
Boundary descriptions include a responsibility summary (what it does, not just what it is).
- **Test:** Each boundary/component label includes or is accompanied by a 1-sentence responsibility description.
- **Sources:** Domain-driven design bounded context practices

---

## Data Flow (DF1–DF3)

### DF1: End-to-End Data Flows
Primary data flows are shown end-to-end (input to storage to output).
- **Test:** At least one diagram traces data from external input through processing to final output/storage.
- **Sources:** [Educative — Architecture Diagramming](https://www.educative.io/blog/software-architecture-diagramming-and-patterns)

### DF2: Transformation Labels
Data transformations at each stage are labeled (what changes, what format, what validation).
- **Test:** Arrows or nodes in data flow diagrams include transformation descriptions.
- **Sources:** Data flow diagram conventions

### DF3: Async vs Sync Distinction
Async vs sync flows are visually distinguished (different arrow styles, labels, or annotations).
- **Test:** Async flows use dashed lines, queues, or explicit "async" labels distinct from sync flows.
- **Sources:** Architecture diagram conventions

---

## Layer Identification (LI1–LI3)

### LI1: Named Layers
Architectural layers are explicitly named (presentation, business logic, data, infrastructure, etc.).
- **Test:** Document contains a section or diagram that names and describes each layer.
- **Sources:** [Clean Architecture — Robert Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### LI2: Cross-Layer Dependencies Shown
Cross-layer dependencies are shown and direction justified (which layer depends on which).
- **Test:** Layer diagram shows dependency arrows with direction labeled.
- **Sources:** Architecture layer dependency conventions

### LI3: Layer Violations Called Out
Layer violations (if any) are explicitly identified as findings, not hidden.
- **Test:** Any dependency that goes against the expected layer direction is flagged with a warning/callout.
- **Sources:** Clean architecture principles

---

## Dependency Mapping (DM1–DM3)

### DM1: Runtime Dependencies Listed
Key runtime dependencies are listed with versions or constraints.
- **Test:** A dependency table or list exists with package names and version constraints.
- **Sources:** Software bill of materials best practices

### DM2: Circular Dependencies Flagged
Circular dependencies are explicitly flagged as findings.
- **Test:** If circular dependencies exist, they are called out with a warning/callout. If none exist, absence is confirmed.
- **Sources:** Software architecture anti-pattern documentation

### DM3: External Service Dependencies
External service dependencies include availability/SLA notes or at minimum identify the external dependency.
- **Test:** External services are listed with at least a reliability/availability note.
- **Sources:** Cloud architecture documentation practices

---

## Entry Points (EP1–EP2)

### EP1: Application Entry Points
Application entry points (main, index, handler) are identified and documented.
- **Test:** Entry point files/functions are named in the document.
- **Sources:** Software documentation best practices

### EP2: Key Interfaces
Key user-facing and API-facing interfaces are documented with their purpose.
- **Test:** Public APIs, CLI commands, or UI entry points are listed with descriptions.
- **Sources:** API documentation conventions

---

## Problem Callouts (PC1–PC2)

### PC1: Problems Visually Distinct
Problems/risks use a different visual treatment than descriptive content (callout boxes, warning icons, colored borders).
- **Test:** Problem sections are styled differently from descriptive sections (different background, icon, or border).
- **Sources:** Tufte's graphical integrity, NN/G visual hierarchy

### PC2: Problems Are Observations Not Prescriptions
Problems are stated as observations ("X depends on Y creating a circular dependency") not recommendations ("You should refactor X").
- **Test:** Problem statements use descriptive language, not imperative/prescriptive language.
- **Sources:** User's explicit requirement — problem identification, not recommendations

---

## Source Grounding (SG1–SG3)

### SG1: Real Identifiers from Source Code
All labels in diagrams — module names, type names, function signatures, file paths — must come from the actual codebase, not abstract descriptions. Use `EnginePort`, not "Engine Interface." Use `Promise<Deal>`, not "async result." Use `formatter.ts`, not "output layer."
- **Test:** For each labeled element in a diagram, verify the identifier exists in the codebase (file name, type name, function name, or interface name). Abstract labels like "Data Layer" or "Output Module" fail unless they correspond to an actual named construct.
- **Sources:** Session-validated principle — source-grounded diagrams scored 8-9/10 vs abstract diagrams that score 4-5/10

### SG2: Type Signatures in Context Boxes
Boxes representing modules or components must include 2-4 representative type signatures showing the key inputs and outputs of that module. These signatures serve as verifiable evidence that the diagram is accurate.
- **Test:** Each component box includes at least one type signature. Verify the signature matches the actual code.
- **Sources:** Session-validated principle — inline type signatures create trust and enable verification

---

## Comparison Layout (CMP1–CMP2)

### CMP1: Side-by-Side for Parallel Paths
When two or more consumers, implementations, or paths exist through the same system, they must be shown side-by-side in a grid layout — not sequentially. The shared starting point should be visually identical at the top, with divergence visible as the paths descend.
- **Test:** When parallel paths exist, verify they are in adjacent columns (CSS grid or flexbox side-by-side), not one after the other. The visual contrast between paths is the explanation.
- **Sources:** [NN/G — Comparison Tables](https://www.nngroup.com/articles/comparison-tables/), session-validated principle

### CMP2: Divergence Point Annotation
In side-by-side comparisons, the point where paths diverge must be visually marked and annotated. Use a distinct label (e.g., "serialization boundary" vs "no serialization — typed objects pass through") that names the architectural decision causing the divergence.
- **Test:** Verify the divergence point has a visually distinct annotation (colored label, icon, or callout) naming what causes the paths to differ.
- **Sources:** Session-validated principle — the divergence annotation was the single most valuable element in the 8-9/10 rated artifact
