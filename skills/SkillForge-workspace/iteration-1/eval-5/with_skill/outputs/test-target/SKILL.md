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

**Example 1: Run a basic task**
```
User: "Do something with my list of items"
-> Invokes DoSomething workflow
-> Reads user input, determines the action needed
-> Executes the task on the provided list of items
```

**Example 2: Execute a run task request**
```
User: "Run task to organize my notes"
-> Invokes DoSomething workflow
-> Identifies the target (notes) from user context
-> Performs the organizational action and confirms completion
```
