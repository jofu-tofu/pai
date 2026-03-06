---
name: HomeServer
description: Home server management -- check status, deploy updates, view logs, and SSH connectivity. USE WHEN server status, check server, is the server up, deploy update, push update, deploy to server, server logs, view logs, show logs, tail logs, server health, restart service, home server, homelab.
---

## Customization

**Before executing, check for user customizations at:**
`$PAI_DIR/skills/PAI/USER/SKILLCUSTOMIZATIONS/HomeServer/`

If this directory exists, load and apply any PREFERENCES.md, configurations, or resources found there. These override default behavior. If the directory does not exist, proceed with skill defaults.

# HomeServer Skill

Remote home server management through SSH. Check service health, deploy updates, view and search logs -- all through a unified interface that handles SSH connectivity automatically.

## Visibility

This skill runs in the foreground. Server status checks, deployment output, and log streams are displayed directly so you can monitor operations in real time.

---

## Workflow Routing

### User-Facing Workflows

| Workflow | Trigger | Purpose | File |
|----------|---------|---------|------|
| **CheckStatus** | "server status", "check server", "is the server up", "server health", "what's running" | Check service health, resource usage, and uptime | `Workflows/CheckStatus.md` |
| **DeployUpdate** | "deploy update", "push update", "deploy to server", "update server", "roll out" | Deploy application or configuration updates to the server | `Workflows/DeployUpdate.md` |
| **ViewLogs** | "server logs", "view logs", "show logs", "tail logs", "search logs" | View, tail, or search service logs on the server | `Workflows/ViewLogs.md` |

### Internal Workflows

| Workflow | Purpose | File |
|----------|---------|------|
| **SSHConnect** | Establish and manage SSH connections to the home server. Called internally by all other workflows -- never invoked directly by the user. | `Workflows/SSHConnect.md` |

**Composition Rules:**
- All user-facing workflows call SSHConnect internally before executing remote commands
- CheckStatus can be called before DeployUpdate to verify pre-deployment health
- ViewLogs is commonly called after DeployUpdate to verify deployment success
- Typical deployment flow: CheckStatus -> DeployUpdate -> ViewLogs

---

## Examples

### Status Check

**Example 1: Quick Health Check**
```
User: "Is the server up?"
-> Invokes CheckStatus workflow
-> SSHConnect establishes connection
-> Runs health checks (uptime, disk, memory, CPU, services)
-> Returns structured status report
```

**Example 2: Service-Specific Status**
```
User: "Check if nginx is running on the server"
-> Invokes CheckStatus workflow with service filter
-> SSHConnect establishes connection
-> Checks specific service status via systemctl
-> Returns service state and recent activity
```

### Deployment

**Example 3: Deploy Application Update**
```
User: "Deploy the latest changes to the server"
-> Invokes DeployUpdate workflow
-> SSHConnect establishes connection
-> Pulls latest code, rebuilds if needed, restarts services
-> Reports deployment result
```

**Example 4: Configuration Update**
```
User: "Push the new nginx config to the server"
-> Invokes DeployUpdate workflow
-> SSHConnect establishes connection
-> Copies config, validates syntax, reloads service
-> Confirms successful reload
```

### Log Viewing

**Example 5: Tail Recent Logs**
```
User: "Show me the last 50 lines of nginx logs"
-> Invokes ViewLogs workflow
-> SSHConnect establishes connection
-> Tails specified log with line count
-> Returns formatted log output
```

**Example 6: Search Logs for Errors**
```
User: "Search for errors in the server logs from today"
-> Invokes ViewLogs workflow
-> SSHConnect establishes connection
-> Greps journalctl or log files for error patterns
-> Returns matching entries with context
```

---

## Quick Reference

### Workflow Summary

| Workflow | Input | Output | Typical Duration |
|----------|-------|--------|------------------|
| **CheckStatus** | Optional: service name | Structured health report | ~5-10s |
| **DeployUpdate** | Update target, optional: branch/tag | Deployment result with status | ~30s-5min |
| **ViewLogs** | Service name, optional: line count, search pattern | Formatted log output | ~5-15s |
| **SSHConnect** | Connection parameters (from config) | Active SSH session | ~2-5s |

### Common Composition Patterns

```
Pre-deploy check:   CheckStatus -> DeployUpdate -> ViewLogs
Quick diagnosis:    CheckStatus -> ViewLogs
Post-incident:      ViewLogs (with search) -> CheckStatus
Routine check:      CheckStatus (standalone)
```

---

## Standards

| Standard | Purpose | Location |
|----------|---------|----------|
| **ServerConfig** | Server connection details, service definitions, and deployment targets | `Standards/ServerConfig.md` |

---

## When to Use

### Status Checks
- Morning routine server health verification
- Before deploying updates
- After infrastructure changes
- When services seem slow or unresponsive
- Periodic uptime monitoring

### Deployments
- Pushing application code updates
- Updating server configurations (nginx, systemd units, etc.)
- Rolling out security patches
- Restarting services after config changes

### Log Viewing
- Investigating errors or unexpected behavior
- Post-deployment verification
- Security audit and access log review
- Debugging service failures
- Monitoring application performance

---

## Related Skills

- **System** - PAI system integrity and documentation (distinct from home server management)
