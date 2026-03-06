# ServerConfig Standard

Defines the home server connection details, monitored services, deployment targets, and log locations used by all HomeServer workflows.

---

## Connection Settings

Update these values to match your home server setup.

| Setting | Value | Description |
|---------|-------|-------------|
| **Host** | `homeserver.local` | Hostname or IP address of the server |
| **User** | `admin` | SSH username |
| **Port** | `22` | SSH port |
| **Key** | `~/.ssh/id_ed25519` | Path to SSH private key |

---

## Monitored Services

Services checked by the CheckStatus workflow by default. Add or remove entries to match your server.

| Service | systemd Unit | Description | Critical |
|---------|-------------|-------------|----------|
| Nginx | `nginx.service` | Web server / reverse proxy | Yes |
| Docker | `docker.service` | Container runtime | Yes |
| SSH | `ssh.service` | SSH daemon | Yes |
| Fail2Ban | `fail2ban.service` | Intrusion prevention | No |
| Unattended Upgrades | `unattended-upgrades.service` | Automatic security patches | No |

---

## Deployment Targets

Mappings of application names to their server-side paths and deployment commands. Used by the DeployUpdate workflow.

| Application | Server Path | Branch | Build Command | Restart Command |
|-------------|-------------|--------|---------------|-----------------|
| (example) webapp | `/opt/webapp` | `main` | `npm install && npm run build` | `sudo systemctl restart webapp` |
| (example) api | `/opt/api` | `main` | `docker-compose build` | `docker-compose up -d` |

---

## Log Locations

Custom log file paths for services that do not use journalctl or have additional log files. Used by the ViewLogs workflow.

| Service | Log Path | Description |
|---------|----------|-------------|
| Nginx Access | `/var/log/nginx/access.log` | HTTP request log |
| Nginx Error | `/var/log/nginx/error.log` | Nginx error log |
| Auth | `/var/log/auth.log` | Authentication and SSH log |
| Syslog | `/var/log/syslog` | General system log |

---

## Resource Thresholds

Alert thresholds used by CheckStatus for health reporting.

| Resource | Warning | Critical |
|----------|---------|----------|
| CPU Load (per core) | > 1.0 | > 2.0 |
| Memory Usage | > 85% | > 95% |
| Disk Usage | > 80% | > 90% |
| Swap Usage | > 50% | > 80% |

---

## Customization

To override these defaults for your server, create a PREFERENCES.md file at:
```
$PAI_DIR/skills/PAI/USER/SKILLCUSTOMIZATIONS/HomeServer/PREFERENCES.md
```

Your preferences file should follow the same table format and will take precedence over the values defined here.
