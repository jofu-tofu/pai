# CheckStatus Workflow

> **Trigger:** "check server status", "server health", "is the server up"

## Reference Material

- **SshConnect:** `SshConnect.md` — Internal SSH connection handler used for server communication.

## Purpose

Check the current health and status of the home server, reporting key metrics like uptime, CPU usage, memory usage, and disk space.

## Workflow Steps

### Step 1: Establish Connection

Call the SshConnect workflow to establish an SSH session to the home server.

### Step 2: Run Health Checks

Execute the following checks on the remote server:
- System uptime (`uptime`)
- CPU usage (`top -bn1 | head -5` or equivalent)
- Memory usage (`free -h`)
- Disk usage (`df -h`)
- Running services (`systemctl list-units --state=running --no-pager | head -20`)

### Step 3: Report Results

Format the output as a structured status report:

```
Server Status Report
--------------------
Uptime:     [value]
CPU Usage:  [value]
Memory:     [used] / [total]
Disk:       [used] / [total] ([percent])
Services:   [count] running
```

### Step 4: Flag Issues

If any metric exceeds a warning threshold, flag it:
- CPU usage above 80%
- Memory usage above 85%
- Disk usage above 90%
