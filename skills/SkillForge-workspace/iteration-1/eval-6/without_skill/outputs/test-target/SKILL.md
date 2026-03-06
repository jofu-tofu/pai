---
name: TestTarget
description: A test skill for processing user input and executing tasks. USE WHEN the user wants to process input or run a task.
---
# TestTarget

A simple test skill for evaluation purposes.

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

| Workflow | Trigger | File |
|----------|---------|------|
| **ProcessInput** | "do something", "run task", "process input" | `Workflows/ProcessInput.md` |
