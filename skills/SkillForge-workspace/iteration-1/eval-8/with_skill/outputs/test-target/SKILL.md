---
name: TestTarget
description: Execute general-purpose tasks via structured workflow. USE WHEN test target OR run test target OR do something OR run task OR execute task OR process with test target OR test target task OR handle this task OR run the do something workflow OR use test target.
---
# TestTarget

A simple test skill for evaluation purposes.

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

| Workflow | Trigger | File |
|----------|---------|------|
| **DoSomething** | "do something", "run task" | `Workflows/DoSomething.md` |
