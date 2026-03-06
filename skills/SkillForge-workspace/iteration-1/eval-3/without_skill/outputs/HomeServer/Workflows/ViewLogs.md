# ViewLogs Workflow

**Purpose:** View, tail, and search service logs on the home server. Supports journalctl-managed services and traditional log files.

**Triggers:** "server logs", "view logs", "show logs", "tail logs", "search logs", "check errors"

---

## When to Use

- Investigating errors or unexpected behavior
- Post-deployment verification
- Reviewing access logs for security
- Debugging service failures or crashes
- Monitoring application output in real time
- Searching for specific events or patterns

---

## Execution

### Step 1: Establish Connection

Load and invoke `Workflows/SSHConnect.md` to establish an SSH connection. If the connection fails, report the failure and stop.

### Step 2: Determine Log Source and Mode

Parse the user's request to determine:

| Parameter | Default | Description |
|-----------|---------|-------------|
| **Service** | (required) | Which service's logs to view |
| **Mode** | `recent` | `recent` (last N lines), `search` (grep pattern), `follow` (live tail) |
| **Lines** | 50 | Number of lines to show (for `recent` mode) |
| **Pattern** | none | Search pattern (for `search` mode) |
| **Since** | none | Time filter (e.g., "1 hour ago", "today", "2024-01-15") |
| **Priority** | none | Severity filter (e.g., `err`, `warning`, `crit`) |

If the service is not specified, ask the user.

### Step 3: Execute Log Query

**Mode: Recent (default)**
```bash
# For systemd services:
journalctl -u <service-name> --no-pager -n <lines> --since "<since>"

# For traditional log files:
tail -n <lines> /var/log/<service>/<logfile>
```

**Mode: Search**
```bash
# For systemd services:
journalctl -u <service-name> --no-pager --since "<since>" --grep "<pattern>"

# For traditional log files:
grep -n "<pattern>" /var/log/<service>/<logfile> | tail -n <lines>

# With context lines:
grep -n -C 3 "<pattern>" /var/log/<service>/<logfile> | tail -n <lines>
```

**Mode: Follow (live tail)**
```bash
# For systemd services:
journalctl -u <service-name> -f --no-pager

# For traditional log files:
tail -f /var/log/<service>/<logfile>
```

Note: Follow mode runs until interrupted. Inform the user they can stop it when ready.

**Priority Filter:**
```bash
# Show only errors and above
journalctl -u <service-name> --no-pager -p err -n <lines>

# Show warnings and above
journalctl -u <service-name> --no-pager -p warning -n <lines>
```

### Step 4: Common Log Locations

If the user asks for logs by category rather than service name, use these common paths:

| Category | journalctl unit | File path |
|----------|----------------|-----------|
| System | `journalctl --system` | `/var/log/syslog` |
| Auth/SSH | `journalctl -u ssh` | `/var/log/auth.log` |
| Nginx | `journalctl -u nginx` | `/var/log/nginx/access.log`, `/var/log/nginx/error.log` |
| Docker | `journalctl -u docker` | `docker logs <container>` |
| Cron | `journalctl -u cron` | `/var/log/cron.log` |
| Kernel | `journalctl -k` | `/var/log/kern.log` |
| Boot | `journalctl -b` | N/A |

### Step 5: Format Output

For structured display, format log entries clearly:

```markdown
# Log Output: [service-name]

**Host:** [hostname]
**Time range:** [start] to [end]
**Lines shown:** [count]
**Filter:** [pattern or priority, if any]

---

[formatted log entries]

---

**Summary:**
- Total entries: [count]
- Errors found: [count]
- Warnings found: [count]
```

If the output is very long (> 100 lines), summarize key findings and offer to show the full output.

### Step 6: Error Highlighting

When displaying logs, call attention to:
- Lines containing `error`, `ERROR`, `fatal`, `FATAL`, `panic`, `PANIC`
- Lines containing `failed`, `FAILED`, `denied`, `timeout`
- Stack traces or exception blocks
- Sudden gaps in timestamps (possible crashes/restarts)

---

## Configuration

Refer to `Standards/ServerConfig.md` for:
- Service-to-log-path mappings
- Custom log file locations
- Default line counts and time windows

---

## Related Workflows

- `CheckStatus.md` - Get service status alongside log data
- `DeployUpdate.md` - ViewLogs is commonly used after deployments
- `SSHConnect.md` - Handles the underlying connection (called automatically)
