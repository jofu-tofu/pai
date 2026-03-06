---
name: TestTarget
description: A test skill for processing input and executing tasks. USE WHEN process input OR run task OR handle input OR test target.
---
# TestTarget

Process user input and execute requested tasks. Serves as a minimal test skill for evaluating SkillForge workflows.

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

| Workflow | Trigger | File |
|----------|---------|------|
| **ProcessInput** | "process input", "run task", "handle input" | `Workflows/ProcessInput.md` |

## Examples

**Example 1: Process a task**
```
User: "Process this input and run the task"
-> Invokes ProcessInput workflow
-> Reads and parses user input
-> Executes the requested action
-> Reports results
```

**Example 2: Handle input directly**
```
User: "Handle this input for me"
-> Invokes ProcessInput workflow
-> Identifies task type from input
-> Performs the action
-> Summarizes what was done
```
