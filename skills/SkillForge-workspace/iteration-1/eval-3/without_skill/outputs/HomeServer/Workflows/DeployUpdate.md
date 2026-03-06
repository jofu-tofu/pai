# DeployUpdate Workflow

**Purpose:** Deploy application updates, configuration changes, or system patches to the home server. Handles the full deployment lifecycle: connect, validate, deploy, verify.

**Triggers:** "deploy update", "push update", "deploy to server", "update server", "roll out"

---

## When to Use

- Pushing new application code to the server
- Updating server configurations (nginx, systemd units, cron jobs, etc.)
- Applying system or security patches
- Restarting or reloading services after configuration changes

---

## Execution

### Step 1: Establish Connection

Load and invoke `Workflows/SSHConnect.md` to establish an SSH connection. If the connection fails, report the failure and stop.

### Step 2: Identify Update Type

Determine the type of deployment from the user's request:

| Type | Description | Strategy |
|------|-------------|----------|
| **Code Deploy** | Pull latest code from a git repository on the server | `git pull` + rebuild + restart |
| **Config Update** | Push a configuration file to the server | `scp` + validate + reload |
| **System Patch** | Apply OS-level updates | `apt update && apt upgrade` (or equivalent) |
| **Service Restart** | Simply restart a service | `systemctl restart <service>` |

If the type is ambiguous, ask the user to clarify.

### Step 3: Pre-Deployment Checks

Before deploying, verify the server is in a healthy state:

```bash
# Check current service status
systemctl status <target-service> --no-pager

# Check disk space (deployments need room)
df -h /

# Check if any processes are holding locks
fuser /var/lib/dpkg/lock 2>/dev/null && echo "LOCKED" || echo "OK"
```

If pre-deployment checks show problems, warn the user and ask whether to proceed.

### Step 4: Execute Deployment

**Code Deploy:**
```bash
cd /path/to/application
git fetch origin
git pull origin <branch>

# If build step is needed:
# npm install && npm run build
# OR docker-compose build && docker-compose up -d
# OR make && make install

# Restart the service
sudo systemctl restart <service-name>
```

**Config Update:**
```bash
# Backup existing config
sudo cp /etc/<service>/config /etc/<service>/config.bak.$(date +%Y%m%d%H%M%S)

# Copy new config (from local machine via scp)
# scp <local-config> <user>@<host>:/etc/<service>/config

# Validate config syntax (service-specific)
# nginx: sudo nginx -t
# sshd: sudo sshd -t
# systemd: sudo systemd-analyze verify <unit>

# Reload the service (not full restart if possible)
sudo systemctl reload <service-name>
```

**System Patch:**
```bash
sudo apt update
sudo apt list --upgradable

# Show what will be upgraded, ask user to confirm
sudo apt upgrade -y

# Check if reboot is needed
[ -f /var/run/reboot-required ] && echo "REBOOT REQUIRED" || echo "No reboot needed"
```

**Service Restart:**
```bash
sudo systemctl restart <service-name>
systemctl status <service-name> --no-pager
```

### Step 5: Post-Deployment Verification

After deployment, verify success:

```bash
# Check service is running
systemctl is-active <service-name>

# Check for errors in recent logs
journalctl -u <service-name> --no-pager -n 30 --since "2 minutes ago"

# If it's a web service, check HTTP response
curl -s -o /dev/null -w "%{http_code}" http://localhost:<port>/health 2>/dev/null || echo "No health endpoint"
```

### Step 6: Report Format

```markdown
# Deployment Report

**Target:** [service/application name]
**Type:** [Code Deploy / Config Update / System Patch / Service Restart]
**Timestamp:** [deployment time]

## Pre-Deployment
- Server health: [OK/WARNINGS]
- Previous version: [version or commit hash]

## Deployment
- Action taken: [description]
- Duration: [time]
- Result: [SUCCESS/FAILED/PARTIAL]

## Post-Deployment
- Service status: [running/failed]
- Health check: [passed/failed/N/A]
- New version: [version or commit hash]

## Rollback Info
- Config backup: [backup path, if applicable]
- Previous commit: [hash, if code deploy]
- Rollback command: [command to revert]
```

---

## Rollback Procedure

If deployment fails or causes issues:

1. **Config Update:** Restore from backup
   ```bash
   sudo cp /etc/<service>/config.bak.<timestamp> /etc/<service>/config
   sudo systemctl reload <service-name>
   ```

2. **Code Deploy:** Revert to previous commit
   ```bash
   cd /path/to/application
   git checkout <previous-commit>
   sudo systemctl restart <service-name>
   ```

3. **System Patch:** Cannot easily rollback -- monitor and address issues as they arise

---

## Safety Notes

- Always create config backups before overwriting
- Validate config syntax before reloading services
- Never force-push or reset git history on the server
- If the user has not specified what to deploy, ask before proceeding
- System patches may require a reboot -- always inform the user

---

## Configuration

Refer to `Standards/ServerConfig.md` for:
- Default deployment paths and repositories
- Service-to-repository mappings
- Build and restart commands per service

---

## Related Workflows

- `CheckStatus.md` - Pre/post deployment health verification
- `ViewLogs.md` - Post-deployment log verification
- `SSHConnect.md` - Handles the underlying connection (called automatically)
