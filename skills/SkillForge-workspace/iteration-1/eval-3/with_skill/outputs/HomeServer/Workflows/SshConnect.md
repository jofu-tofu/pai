# SshConnect Workflow

> **Trigger:** Internal only — called by other HomeServer workflows. Not user-invokable.

## Reference Material

- None.

## Purpose

Establish and manage SSH connections to the home server. This is an internal workflow that other HomeServer workflows call to avoid duplicating connection logic.

## Workflow Steps

### Step 1: Load Connection Configuration

Read the SSH connection parameters:
- **Host:** The server hostname or IP address (from environment variable `HOME_SERVER_HOST` or configured default)
- **User:** The SSH username (from `HOME_SERVER_USER` or configured default)
- **Port:** The SSH port (from `HOME_SERVER_PORT`, default: 22)
- **Key:** Path to the SSH private key (from `HOME_SERVER_KEY`, default: `~/.ssh/id_rsa`)

### Step 2: Build SSH Command

Construct the SSH command with appropriate flags:

```bash
ssh -o ConnectTimeout=10 \
    -o StrictHostKeyChecking=accept-new \
    -p [port] \
    -i [key_path] \
    [user]@[host]
```

### Step 3: Test Connection

Verify the connection is viable before handing control back to the calling workflow:
- Run a simple command (`echo "connected"`) over SSH
- If the connection fails, report the error with actionable diagnostics:
  - Host unreachable: suggest checking network/VPN
  - Auth failure: suggest checking SSH key permissions
  - Timeout: suggest checking firewall rules

### Step 4: Return Connection Handle

Provide the established SSH command prefix to the calling workflow so it can execute remote commands by prepending this prefix to any command string.
