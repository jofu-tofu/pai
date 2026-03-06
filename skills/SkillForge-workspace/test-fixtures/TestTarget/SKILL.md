---
name: TestTarget
description: A test skill for processing tasks. USE WHEN test target.
---
# TestTarget

A simple test skill for evaluation purposes.

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

| Workflow | Trigger | File |
|----------|---------|------|
| **DoSomething** | "do something", "run task" | `Workflows/DoSomething.md` |
