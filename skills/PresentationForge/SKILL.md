---
name: PresentationForge
description: Format-aware document and presentation authoring for HTML documents and PowerPoint deliverables. USE WHEN user wants to create a presentation, create an HTML document, choose between HTML documents and professional PPT decks, convert between formats, run readability checks, polish a deck for delivery, visualize architecture, diagram the codebase, create architecture diagram, show type flow, diagram how modules connect, or create a visual explanation of code.
---

# PresentationForge

Create and refine documents and presentations with a content-first, format-aware strategy:
- HTML for scrollable, link-friendly, readable documents
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
| **CreateHtmlDocument** | "create html document", "build web document", "create html report", "create scrollable report" | `Workflows/CreateHtmlDocument.md` |
| **CreatePptPresentation** | "create ppt deck", "create powerpoint deck", "create professional deck" | `Workflows/CreatePptPresentation.md` |
| **RepurposePresentation** | "convert presentation", "html to ppt", "ppt to html", "html to powerpoint", "powerpoint to html", "turn into powerpoint" | `Workflows/RepurposePresentation.md` |
| **ReviewPresentation** | "review presentation", "polish slide deck", "presentation quality check" | `Workflows/ReviewPresentation.md` |
| **ReadabilityGate** | "readability check", "check readability", "run readability gate" | `Workflows/ReadabilityGate.md` |

## Tools

| Tool | Purpose | Usage |
|------|---------|-------|
| `Tools/open-in-browser.ts` | Opens a file in the user's default browser (WSL/macOS/Linux) | `bun Tools/open-in-browser.ts <file-path>` |

## Context Files

| File | Purpose |
|------|---------|
| `FirstPrinciples.md` | Fundamental model, constraint classification, and architecture rationale |
| `FormatSelection.md` | Decision matrix for choosing HTML Document vs PPT |
| `ToolingLandscape.md` | Verified external tooling and community references with trade-offs |
| `Standards/ReadabilityStandards.md` | Research-backed readability rules for all content types (35 rules) |
| `Standards/CodebaseAnalysisStandards.md` | Content-specific rules for codebase analysis documents (~28 rules) |

## Known Gotchas

- Mermaid `11.12.3` parsing is sensitive to label text. In diagram labels/messages, avoid `$`, escaped `\n`, and punctuation-heavy strings when a plain-language label works. If rendering fails, simplify labels and re-open the HTML artifact.

## Examples

**Example 1: Codebase analysis document**
```
User: "Create an html document analyzing this codebase's architecture"
-> Invokes CreatePresentation workflow
-> Detects content type: codebase-analysis
-> Routes to CreateHtmlDocument for scrollable HTML output
-> Auto-chains ReadabilityGate with general + codebase-analysis standards
```

**Example 2: Professional board deck**
```
User: "Create a powerpoint deck for executive review"
-> Invokes CreatePptPresentation workflow
-> Uses template-safe PPT path and applies readability standards
-> Returns a professional PPTX-ready structure with notes
```

**Example 3: Readability check**
```
User: "Run a readability check on this document"
-> Invokes ReadabilityGate workflow
-> Scores against ReadabilityStandards (+ content-type-specific standards if applicable)
-> Returns advisory PASS/FAIL verdict with severity-ranked findings
```
