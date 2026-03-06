---
name: HomeServer
description: Manage home server operations including health checks, deployments, and log inspection. Centralizes SSH connection handling so workflows stay DRY. USE WHEN check server status OR deploy updates OR view server logs OR home server OR server health OR server deployment OR show server logs OR restart server OR server management.
---

# HomeServer

Home server management skill: check status, deploy updates, and view logs through a unified interface with shared SSH connectivity.

> **For agents using this skill:** All server communication flows through the internal SshConnect workflow. Individual workflows call SshConnect rather than managing connections directly.

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

| Workflow | Trigger | File |
|----------|---------|------|
| **CheckStatus** | "check server status", "server health", "is the server up" | `Workflows/CheckStatus.md` |
| **DeployUpdates** | "deploy updates", "push update to server", "server deployment" | `Workflows/DeployUpdates.md` |
| **ViewLogs** | "view server logs", "show logs", "check server logs" | `Workflows/ViewLogs.md` |

## Examples

**Example 1: Check server health**
```
User: "Is my home server up?"
-> Invokes CheckStatus workflow
-> Connects via SshConnect, runs health checks
-> Returns system status: uptime, CPU, memory, disk usage
```

**Example 2: Deploy an update**
```
User: "Deploy the latest updates to my home server"
-> Invokes DeployUpdates workflow
-> Connects via SshConnect, pulls latest changes, restarts services
-> Reports deployment result with service status confirmation
```

**Example 3: View recent logs**
```
User: "Show me the server logs from today"
-> Invokes ViewLogs workflow
-> Connects via SshConnect, retrieves filtered log output
-> Displays formatted log entries with optional filtering
```
