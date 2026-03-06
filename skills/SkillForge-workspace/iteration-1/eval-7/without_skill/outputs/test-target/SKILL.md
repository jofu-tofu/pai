---
name: BadTriggers
description: >-
  Reads, transforms, and outputs structured data files through a multi-step
  processing pipeline. USE WHEN the user asks to process data files, transform
  data formats, convert or restructure data, parse incoming data, run a data
  pipeline, extract and reformat file contents, or batch-process data inputs.
  DO NOT USE WHEN the user is asking about data analysis, visualization,
  charting, or statistical queries — this skill handles file-level data
  transformation, not analytical interpretation.
---
# BadTriggers

Processes data in various ways.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **ProcessData** | "process" | `Workflows/ProcessData.md` |
