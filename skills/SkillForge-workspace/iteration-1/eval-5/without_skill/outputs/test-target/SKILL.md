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

## Examples

### Example 1: Running a basic task
**User:** "Do something with my list of items"
**Trigger:** Matches "do something" -> routes to DoSomething workflow
**Result:** The skill reads the user's input, determines the action needed, and executes the task on the provided list of items.

### Example 2: Executing a run task request
**User:** "Run task to organize my notes"
**Trigger:** Matches "run task" -> routes to DoSomething workflow
**Result:** The skill interprets the request as a task execution, reads the input context about notes, and performs the organizational action requested.
