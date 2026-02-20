---
name: PresentationForge
description: Format-aware presentation authoring for HTML and PowerPoint deliverables. USE WHEN user wants to create a presentation, choose between lightweight HTML slides and professional PPT decks, convert between HTML and PPT, or polish a deck for delivery.
---

# PresentationForge

Create and refine presentation decks with a format-first strategy:
- HTML for lightweight, link-friendly, low-overhead decks
- PPT/PPTX for enterprise and formal stakeholder settings

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

**When executing a workflow, output this notification:**

```
Running the **WorkflowName** workflow from the **PresentationForge** skill...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **CreatePresentation** | "create presentation", "build slide deck", "make deck", "make a slideshow", "generate slides" | `Workflows/CreatePresentation.md` |
| **CreateHtmlPresentation** | "create html slides", "build web slides", "create lightweight slides" | `Workflows/CreateHtmlPresentation.md` |
| **CreatePptPresentation** | "create ppt deck", "create powerpoint deck", "create professional deck" | `Workflows/CreatePptPresentation.md` |
| **RepurposePresentation** | "convert presentation", "html to ppt", "ppt to html", "html to powerpoint", "powerpoint to html", "turn into powerpoint" | `Workflows/RepurposePresentation.md` |
| **ReviewPresentation** | "review presentation", "polish slide deck", "presentation quality check" | `Workflows/ReviewPresentation.md` |

## Context Files

| File | Purpose |
|------|---------|
| `FirstPrinciples.md` | Fundamental model, constraint classification, and architecture rationale |
| `FormatSelection.md` | Decision matrix for choosing HTML vs PPT |
| `ToolingLandscape.md` | Verified external tooling and community references with trade-offs |
| `QualityChecklist.md` | Cross-format quality bar for content and visual execution |

## Examples

**Example 1: Lightweight HTML deck**
```
User: "Create html slides for a 7-minute product update"
-> Invokes CreateHtmlPresentation workflow
-> Selects best-fit HTML engine for the use case
-> Returns deck files plus a short speaker script
```

**Example 2: Professional board deck**
```
User: "Create a powerpoint deck for executive review"
-> Invokes CreatePptPresentation workflow
-> Uses template-safe PPT path and applies presentation quality checklist
-> Returns a professional PPTX-ready structure with notes
```

**Example 3: Convert and polish**
```
User: "Convert this markdown deck from html to ppt and polish it"
-> Invokes RepurposePresentation workflow
-> Converts while preserving message hierarchy and identifies fidelity risks
-> Chains to ReviewPresentation checks and returns fix list
```
