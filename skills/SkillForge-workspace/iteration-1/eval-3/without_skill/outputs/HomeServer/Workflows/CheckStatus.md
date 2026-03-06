# CheckStatus Workflow

**Purpose:** Check the health, resource usage, and service status of the home server. Provides a structured overview of system state.

**Triggers:** "server status", "check server", "is the server up", "server health", "what's running"

---

## When to Use

- Morning or routine health checks
- Before deploying updates (pre-deployment verification)
- When services seem slow or unresponsive
- After infrastructure changes or reboots
- Quick uptime confirmation

---

## Execution

### Step 1: Establish Connection

Load and invoke `Workflows/SSHConnect.md` to establish an SSH connection to the home server. If the connection fails, report the failure and stop.

### Step 2: Gather System Information

Run the following commands on the remote server. Execute independent commands in parallel where possible.

**System Overview:**
```bash
# Uptime and load
uptime

# OS and kernel info
uname -a
```

**Resource Usage:**
```bash
# Disk usage (human-readable, exclude tmpfs)
df -h --exclude-type=tmpfs --exclude-type=devtmpfs

# Memory usage
free -h

# CPU load (snapshot)
top -bn1 | head -5
```

**Service Status:**
```bash
# List active services (filter to relevant ones if ServerConfig defines a service list)
systemctl list-units --type=service --state=running --no-pager

# Check for failed services
systemctl list-units --type=service --state=failed --no-pager
```

**Network:**
```bash
# Listening ports
ss -tlnp
```

### Step 3: Service-Specific Checks (If Requested)

If the user asked about a specific service:
```bash
# Detailed service status
systemctl status <service-name> --no-pager -l

# Recent log entries for the service
journalctl -u <service-name> --no-pager -n 20 --since "1 hour ago"
```

### Step 4: Report Format

Present results in a structured report:

```markdown
# Server Status Report

**Host:** [hostname]
**Checked:** [timestamp]
**Uptime:** [uptime]

## System Resources
| Resource | Usage | Status |
|----------|-------|--------|
| CPU Load | [1/5/15 min averages] | [OK/WARNING/CRITICAL] |
| Memory | [used/total] | [OK/WARNING/CRITICAL] |
| Disk (/) | [used/total (% used)] | [OK/WARNING/CRITICAL] |

## Services
| Service | State | Notes |
|---------|-------|-------|
| [name] | running/stopped/failed | [uptime or error] |

## Failed Services
[List any failed services, or "None"]

## Listening Ports
| Port | Service | Protocol |
|------|---------|----------|
```

### Step 5: Threshold Alerts

Flag any values that exceed warning thresholds:
- CPU load > number of cores: WARNING
- Memory usage > 85%: WARNING
- Memory usage > 95%: CRITICAL
- Disk usage > 80%: WARNING
- Disk usage > 90%: CRITICAL
- Any failed services: WARNING

---

## Configuration

Refer to `Standards/ServerConfig.md` for:
- Which services to monitor by default
- Custom threshold overrides
- Server connection details

---

## Related Workflows

- `DeployUpdate.md` - Often follows a status check
- `ViewLogs.md` - For deeper investigation of issues found
- `SSHConnect.md` - Handles the underlying connection (called automatically)
