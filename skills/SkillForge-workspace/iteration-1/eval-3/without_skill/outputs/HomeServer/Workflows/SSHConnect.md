# SSHConnect Workflow (Internal)

**Purpose:** Establish and manage SSH connections to the home server. This is an internal workflow called by other HomeServer workflows -- it is never invoked directly by the user.

**Visibility:** Internal only. Users interact with CheckStatus, DeployUpdate, or ViewLogs, which call this workflow behind the scenes.

---

## Why This Exists

Every HomeServer workflow needs an SSH connection. Rather than duplicating connection logic across workflows, SSHConnect centralizes:
- Connection parameter resolution
- Authentication handling
- Connection testing and retry logic
- Error reporting for connection failures

---

## Execution

### Step 1: Resolve Connection Parameters

Load connection details from `Standards/ServerConfig.md`. Required parameters:

| Parameter | Source | Example |
|-----------|--------|---------|
| **Host** | ServerConfig | `192.168.1.100` or `homeserver.local` |
| **User** | ServerConfig | `admin` |
| **Port** | ServerConfig (default: 22) | `22` |
| **Key** | ServerConfig (default: `~/.ssh/id_ed25519`) | `~/.ssh/homeserver_key` |

If ServerConfig has not been customized, prompt the calling workflow to ask the user for connection details.

### Step 2: Test Connectivity

Before executing any remote commands, verify the server is reachable:

```bash
# Quick connectivity check (timeout after 5 seconds)
ssh -o ConnectTimeout=5 -o BatchMode=yes -p <port> -i <key> <user>@<host> "echo 'CONNECTION_OK'"
```

### Step 3: Handle Connection Results

**Success:** Return connection parameters to the calling workflow so it can execute remote commands using:
```bash
ssh -o ConnectTimeout=10 -o BatchMode=yes -p <port> -i <key> <user>@<host> "<command>"
```

**Failure — Host Unreachable:**
```
Connection failed: Host <host> is not reachable on port <port>.
Possible causes:
- Server is powered off or disconnected
- Firewall blocking SSH port
- Incorrect hostname/IP address
- Network connectivity issue

Check Standards/ServerConfig.md for connection settings.
```

**Failure — Authentication Denied:**
```
Connection failed: Authentication denied for <user>@<host>.
Possible causes:
- SSH key not authorized on the server
- Incorrect username
- Key file not found at <key>

Verify the SSH key is added to the server's authorized_keys.
```

**Failure — Timeout:**
```
Connection failed: Connection timed out after 5 seconds.
The server may be under heavy load or the network path may be congested.
```

### Step 4: Connection Reuse

For workflows that need to run multiple commands, use a persistent connection via ControlMaster to avoid re-authenticating:

```bash
# Establish control socket
ssh -o ControlMaster=auto -o ControlPath=/tmp/ssh-%r@%h:%p -o ControlPersist=60 \
    -o ConnectTimeout=10 -o BatchMode=yes -p <port> -i <key> <user>@<host> -N -f

# Subsequent commands reuse the connection
ssh -o ControlPath=/tmp/ssh-%r@%h:%p <user>@<host> "<command1>"
ssh -o ControlPath=/tmp/ssh-%r@%h:%p <user>@<host> "<command2>"
```

### Step 5: File Transfer (When Needed)

For workflows like DeployUpdate that need to copy files to the server:

```bash
# Single file
scp -o ConnectTimeout=10 -P <port> -i <key> <local-path> <user>@<host>:<remote-path>

# Directory
scp -r -o ConnectTimeout=10 -P <port> -i <key> <local-dir> <user>@<host>:<remote-dir>

# Using rsync for larger transfers
rsync -avz -e "ssh -p <port> -i <key>" <local-path> <user>@<host>:<remote-path>
```

---

## Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| `SSH_OK` | Connection successful | Proceed with calling workflow |
| `SSH_UNREACHABLE` | Host not reachable | Report to user, stop workflow |
| `SSH_AUTH_FAILED` | Authentication rejected | Report to user, check key/user |
| `SSH_TIMEOUT` | Connection timed out | Retry once, then report to user |
| `SSH_CONFIG_MISSING` | No connection details configured | Ask user to configure ServerConfig |

---

## Configuration

All connection parameters come from `Standards/ServerConfig.md`. This workflow does not have its own configuration -- it relies entirely on the centralized server config.

---

## Security Notes

- Always use key-based authentication (never password prompts in automated workflows)
- Use `BatchMode=yes` to prevent interactive prompts that would hang
- SSH keys should have appropriate permissions (`chmod 600`)
- Never log or display the private key path in user-facing output
- ControlMaster sockets are stored in /tmp with restricted permissions

---

## Called By

- `CheckStatus.md` - For running diagnostic commands remotely
- `DeployUpdate.md` - For executing deployment steps and file transfers
- `ViewLogs.md` - For reading remote log files and journalctl output
