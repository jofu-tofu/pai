# ViewLogs Workflow

> **Trigger:** "view server logs", "show logs", "check server logs"

## Reference Material

- **SshConnect:** `SshConnect.md` — Internal SSH connection handler used for server communication.

## Purpose

Retrieve and display log entries from the home server, with support for filtering by service, time range, and severity level.

## Workflow Steps

### Step 1: Establish Connection

Call the SshConnect workflow to establish an SSH session to the home server.

### Step 2: Determine Log Source

Identify which logs the user wants to see. Common sources:
- System logs: `journalctl`
- Application logs: `/var/log/[app]/` or `docker compose logs`
- Auth logs: `/var/log/auth.log`
- Nginx/Apache: `/var/log/nginx/` or `/var/log/apache2/`

If the user does not specify, default to system logs via `journalctl`.

### Step 3: Apply Filters

Based on user request, apply appropriate filters:

| User Intent | Flag/Command |
|-------------|-------------|
| Recent logs | `journalctl --since "1 hour ago"` |
| Specific service | `journalctl -u [service-name]` |
| Errors only | `journalctl -p err` |
| Today's logs | `journalctl --since today` |
| Last N lines | `journalctl -n [count]` |
| Container logs | `docker compose logs --tail=100 [service]` |

### Step 4: Retrieve and Format

Retrieve the filtered logs and format them for readability:
- Truncate output to a reasonable length (default: last 50 lines)
- Highlight error and warning lines if present
- Include timestamps for context

### Step 5: Present Results

Display the formatted log output. If the log volume is large, offer to:
- Filter further by keyword or severity
- Show a specific time window
- Export to a file for later review
