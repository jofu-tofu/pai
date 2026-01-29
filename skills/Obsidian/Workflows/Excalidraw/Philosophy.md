# Diagram Philosophy

This document explains WHY diagrams work and HOW to make them effective. Read this when you want to understand the reasoning behind the decisions you will make.

---

## Why Diagrams Exist

A diagram transfers understanding between minds by exploiting a fundamental asymmetry:

| Channel | Speed | Mode |
|---------|-------|------|
| Visual processing | 10 million bits/second | Parallel |
| Reading text | ~200 words/minute | Sequential |

This 50,000x difference is WHY diagrams work. The goal is to compress complex understanding into visual patterns that the brain processes in parallel, bypassing slow sequential reading.

**Key insight:** A diagram is a compression algorithm. It deliberately loses information to make the remaining information accessible. The question is always "what can I remove?" not "what should I add?"

---

## The Seven Principles

These principles come from cognitive science research on how humans process visual information.

| # | Principle | Based on | You apply it by |
|---|-----------|----------|-----------------|
| 1 | **One idea per diagram** | Working memory holds 4±1 items | Identifying the single message before drawing |
| 2 | **Visual before verbal** | Parallel processing is faster | Making shapes/positions convey meaning, labels add detail |
| 3 | **Same color = same meaning** | Pre-attentive color processing | Assigning semantic colors consistently |
| 4 | **Flow follows natural reading** | F-pattern and Z-pattern scanning | Arranging left→right or top→bottom |
| 5 | **Size indicates importance** | Pre-attentive size processing | Making the main concept largest |
| 6 | **Proximity indicates relationship** | Gestalt grouping | Placing related items close together |
| 7 | **Remove until it breaks** | Cognitive load has cost | Deleting elements until meaning is lost, then restoring one |

---

## Quality Verification

Run these tests before delivering any diagram. Each test catches a different failure mode.

### The Tests

| Test | What you do | What passing looks like |
|------|-------------|-------------------------|
| **Squint test** | Blur your vision or step back from screen | The visual hierarchy remains obvious—you can still see what's primary, secondary, tertiary |
| **5-second test** | Imagine a new person seeing this for 5 seconds | They would be able to state the main idea in one sentence |
| **Cover-text test** | Mentally hide all labels and text | The visual structure still communicates the core relationships |
| **Grayscale test** | Imagine the diagram without color | The meaning survives through position, size, and shape |
| **Removal test** | Consider deleting each element | Every remaining element is necessary—removing any one breaks comprehension |

### Test Checklist

Use this when verifying:

```
□ Squint test - hierarchy visible when blurred
□ 5-second test - main idea communicable instantly
□ Cover-text test - visual structure carries meaning
□ Grayscale test - color supplements rather than carries meaning
□ Removal test - nothing extraneous remains
```

---

## Formality Levels

The roughness setting communicates intent to viewers.

| Roughness | Visual style | Viewer interprets as | Use when |
|-----------|--------------|----------------------|----------|
| 0 | Architect (clean lines) | "This is the official design" | Documentation, presentations, technical specs |
| 1 | Artist (slight hand-drawn) | "This is the plan" | Most situations, balanced formality |
| 2 | Cartoonist (very sketchy) | "This is a draft/idea" | Brainstorming, early exploration, informal discussion |

**Why this matters:** A polished diagram (roughness 0) shown during brainstorming kills exploration because people treat it as final. A sketchy diagram (roughness 2) in documentation looks unprofessional. Match formality to context.

---

## The 60-30-10 Rule

Balance diagram composition using this ratio from interior design:

| Percentage | What fills it | Example |
|------------|---------------|---------|
| **60%** | Background/whitespace | Empty canvas between elements |
| **30%** | Primary elements | Main boxes, shapes, connectors |
| **10%** | Accent highlights | Critical paths, emphasis colors |

If your diagram feels busy or overwhelming, you have violated this ratio. The fix is almost always to add whitespace, not to reorganize content.

---

## Common Failure Modes

These are the mistakes that make diagrams ineffective:

| Failure | What happens | The fix |
|---------|--------------|---------|
| Too many ideas | Viewer cannot identify main message | Split into multiple diagrams |
| Text-heavy | Sequential reading negates visual advantage | Let shapes/positions carry meaning |
| Inconsistent colors | Viewer wastes attention figuring out meaning | Assign semantic colors and maintain them |
| No clear flow | Eye wanders randomly | Align to natural reading patterns |
| Everything same size | No hierarchy, everything equally important | Scale by importance |
| Isolated elements | Viewer cannot see relationships | Group related items closer |
| Nothing removable | Over-engineered complexity | Delete until meaning breaks, restore one |

---

## Summary

When creating a diagram:

1. **Identify the one idea** you are communicating
2. **Choose formality** based on context (roughness 0/1/2)
3. **Assign semantic colors** that mean the same thing throughout
4. **Arrange for natural flow** (left→right or top→bottom)
5. **Scale by importance** (main idea largest)
6. **Group by relationship** (related items close)
7. **Remove aggressively** until meaning breaks
8. **Verify with tests** before delivering

The goal is not a comprehensive diagram. The goal is a useful diagram that transfers understanding efficiently.
