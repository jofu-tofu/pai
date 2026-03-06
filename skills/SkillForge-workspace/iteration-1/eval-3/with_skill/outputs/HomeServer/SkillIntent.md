# SkillIntent -- HomeServer

> **For agents modifying this skill:** Read this before making any changes.

## First Principles

- Server management should be conversational, not manual SSH gymnastics.
- Connection logic belongs in one place; every workflow reuses it.
- Observability (status, logs) and mutability (deploy) are distinct concerns with different risk profiles.

## Problem This Skill Solves

Without this skill, managing a home server requires remembering SSH connection details, specific command syntax, and log file locations every time. This skill wraps those details behind intent-driven workflows so the user says what they want and the system handles how.

## Design Decisions

| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|
| SSH as internal workflow | SshConnect is a shared internal workflow called by all others | Inline SSH in each workflow; SSH as a Tool | Keeps connection logic DRY and consistent without requiring a compiled tool |
| SshConnect not user-facing | Excluded from routing table | Expose to user as "connect to server" | Users never need a raw connection; they need actions (status, deploy, logs) |
| Three user-facing workflows | CheckStatus, DeployUpdates, ViewLogs | Single "manage server" catch-all workflow | Distinct workflows allow focused steps and clear trigger separation |
| Environment-based config | SSH params from env vars with sensible defaults | Config file, hardcoded values | Flexible across environments without storing secrets in skill files |

## Explicit Out-of-Scope

- Server provisioning or initial setup (use dedicated infrastructure tools)
- Multi-server orchestration (this skill manages one home server)
- Firewall or network configuration changes
- User/permission management on the server
- Backup and restore operations (separate concern, separate skill)

## Success Criteria

- A user can check server health without knowing any SSH commands.
- A user can deploy updates with a single natural-language request.
- A user can retrieve and filter server logs without remembering file paths or journalctl flags.
- All three user-facing workflows reuse SshConnect rather than implementing their own connection logic.
- SshConnect never appears in the routing table or triggers on user input.

## Constraints

- All SSH connection details come from environment variables, never hardcoded in workflow files.
- DeployUpdates must verify server health before and after deployment.
- ViewLogs must default to a bounded output (no unbounded log dumps).
- SshConnect remains internal-only across all future updates.
