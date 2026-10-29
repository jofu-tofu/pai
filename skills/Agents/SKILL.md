---
name: Agents
description: Compose task-specific agent briefs from expertise and working-style traits. USE WHEN create custom agents, specialized agents, agent personalities, parallel agent work.
---

# Agents

Read `PORTABILITY.md` before use.

Write an explicit brief for each role: expertise, task, constraints, evidence available, deliverable and completion check. Dispatch through the current host's agent tools only when supported and authorized. Report sequential role passes when dispatch is unavailable. Await every participant and reconcile conflicting evidence before handoff.

| Request | Read |
|---|---|
| Create a custom role | Workflows/CreateCustomAgent.md |
| List available traits | Workflows/ListTraits.md |
| Run parallel roles | Workflows/SpawnParallelAgents.md |

Optional prompt composition uses Tools/ComposeAgent.ts with local Data/Traits.yaml and Templates/DynamicAgent.hbs. Overrides go in Customizations/Traits.yaml. Install packages from this folder's package.json before using that tool. Voice fields are optional inert metadata; they never start a service or call an API.

## Examples

Ask for the Agents workflow with the relevant task, input files and output destination. Apply the local method using available host tools, then report the result and evidence; identify any unavailable capability.
