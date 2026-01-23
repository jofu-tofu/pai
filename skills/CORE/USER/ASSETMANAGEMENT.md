# Asset Management System

**Purpose:** Centralized registry of your digital assets for instant recognition and management.

## Primary Use Cases

1. **Instant Recognition** - When you mention "my site", the AI knows the full context
2. **Vulnerability Management** - Track what technologies are deployed where
3. **Tech Stack Awareness** - Know frameworks/versions for upgrade planning
4. **Security Posture** - Track security controls across assets

---

## Web Properties

| Site | URL | Local Path | GitHub Repo | Stack | Deployment |
|------|-----|------------|-------------|-------|------------|
| **Main Site** | example.com | `~/Projects/Website` | username/Website | [Framework] | CF Worker |
| **Project Site** | project.example.com | `~/Projects/Project` | username/Project | [Framework] | CF Worker |

### Routing Rules

- "my site", "main site" → ~/Projects/Website
- "project site" → ~/Projects/Project

---

## Deployment Commands

Each website should have its own deploy script:

```bash
# Standard deployment pattern
cd /path/to/project
bun run deploy
git push
```

**Important:** Use `bun run deploy` - the package.json script handles deployment correctly.

---

## Cloud Accounts

| Service | Purpose | Account |
|---------|---------|---------|
| AWS | Infrastructure | your-email@example.com |
| Cloudflare | DNS/CDN | your-email@example.com |
| GitHub | Repositories | username |
| Vercel | Hosting | your-email@example.com |

---

## Domains

| Domain | Registrar | Expiration | DNS Provider |
|--------|-----------|------------|--------------|
| example.com | [Registrar] | YYYY-MM-DD | Cloudflare |

---

## Smart Home (Optional)

| System | Purpose | Documentation |
|--------|---------|---------------|
| Homebridge | HomeKit bridge | See HomeBridgeManagement.md |

---

## Local Applications

| Application | Path | Purpose |
|-------------|------|---------|
| **Obsidian Vault** | `C:\Users\fujos\Obsidian` | Knowledge management, Learning OS |

### Routing Rules

- "obsidian", "my vault", "my notes", "save to obsidian" → Obsidian Vault path
- "inbox" (in Obsidian context) → `Obsidian Vault/0_Inbox/`
- "research notes" → `Obsidian Vault/1_Research/`
- "implementing", "practicing" → `Obsidian Vault/2_Implementing/`
- "learned", "skills", "lessons", "wisdom" → `Obsidian Vault/3_Learned/`

---

## Hardware

| Device | Purpose | Location |
|--------|---------|----------|
| [Workstation] | Primary | Office |
| [Laptop] | Mobile | Mobile |
| [Server] | Services | Home |

---

## API Keys & Credentials

**Note:** Store actual credentials in environment variables or a secure vault, not in this file.

| Service | Environment Variable | Purpose |
|---------|---------------------|---------|
| Anthropic | `ANTHROPIC_API_KEY` | AI API |
| OpenAI | `OPENAI_API_KEY` | AI API |
| Cloudflare | `CF_API_TOKEN` | Deployment |

---

**Instructions:** Replace with your actual assets. The AI uses this for deployment tasks, account management, and troubleshooting.
