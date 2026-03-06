# DeployUpdates Workflow

> **Trigger:** "deploy updates", "push update to server", "server deployment"

## Reference Material

- **SshConnect:** `SshConnect.md` — Internal SSH connection handler used for server communication.

## Purpose

Deploy updates to the home server by pulling the latest changes, running any migration or build steps, and restarting affected services.

## Workflow Steps

### Step 1: Establish Connection

Call the SshConnect workflow to establish an SSH session to the home server.

### Step 2: Pre-Deploy Check

Before deploying, verify the server is in a healthy state:
- Confirm the server is reachable and responding
- Check current disk space to ensure room for updates
- Verify no other deployment is in progress (check for lock files)

### Step 3: Pull Updates

Navigate to the deployment directory and pull the latest changes:
- `cd /opt/server && git pull origin main` (or the configured deployment path)
- If using containers: `docker compose pull`

### Step 4: Run Build Steps

If the project has build requirements:
- Install dependencies (`npm install`, `pip install -r requirements.txt`, etc.)
- Run database migrations if applicable
- Build assets if applicable

### Step 5: Restart Services

Restart affected services:
- `sudo systemctl restart [service-name]`
- If using containers: `docker compose up -d`

### Step 6: Post-Deploy Verification

After deployment, verify services are running:
- Check service status for each restarted service
- Run a basic health check to confirm the server is responding
- Report success or failure with relevant details

### Step 7: Report Results

Provide a deployment summary:

```
Deployment Report
-----------------
Status:     [SUCCESS/FAILED]
Changes:    [git log summary or container image versions]
Services:   [list of restarted services and their status]
Duration:   [time taken]
```
