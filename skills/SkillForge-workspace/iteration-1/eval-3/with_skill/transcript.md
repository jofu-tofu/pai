# CreateSkill Workflow Transcript -- HomeServer Skill

## Task

Create a skill for managing a home server with workflows: CheckStatus, DeployUpdates, ViewLogs (user-facing), and SshConnect (internal, called by the others but never user-invoked).

## Workflow Steps Followed

### Step 1: Load Prompting Standards

**Tool:** `Read` on `/home/fujos/projects/pai/skills/SkillForge/Standards/PromptingStandards.md`

Read the full prompting standards document. Key principles absorbed:
- No XML tags, markdown only
- Be explicit and direct
- Positive framing (tell what to do, not what to avoid)
- Trigger phrases: 2-6 words, natural language, no overlap
- USE WHEN clause: specific enough to match, broad enough to cover variants
- Soft trigger language to avoid overtriggering

Also read `Standards/SkillSystem.md` for the canonical file structure, naming rules, and validation checklist.

### Step 2: Understand the Request

The user provided answers directly in the task description:
1. **What does this skill do?** Manages a home server -- checking status, deploying updates, viewing logs.
2. **What should trigger it?** Home server management commands (check status, deploy, view logs, server health, etc.)
3. **What workflows does it need?** CheckStatus, DeployUpdates, ViewLogs (user-facing) + SshConnect (internal).

No interactive interview was needed; the user pre-specified all requirements.

### Step 3: Classify Workflows

**Decision:** Classified workflows as follows:

| Workflow | Classification | Rationale |
|----------|---------------|-----------|
| CheckStatus | User-facing | User would type "check server status" or "is the server up" |
| DeployUpdates | User-facing | User would type "deploy updates" or "push update to server" |
| ViewLogs | User-facing | User would type "view server logs" or "show logs" |
| SshConnect | Internal | Called by the other three workflows to establish SSH connections; user never invokes directly |

**Routing table decision:** Only CheckStatus, DeployUpdates, and ViewLogs appear in the routing table. SshConnect has a workflow file but is excluded from the table, per the workflow step: "Internal (called by another workflow) -> file exists but NOT in routing table."

### Step 4: Determine TitleCase Names

**Tool:** None needed (naming is straightforward)

All names confirmed as TitleCase:
- Skill directory: `HomeServer`
- Workflows: `CheckStatus.md`, `DeployUpdates.md`, `ViewLogs.md`, `SshConnect.md`

### Step 5: Create Directory Structure

**Tool:** `Bash` -- `mkdir -p` to create:
- `outputs/HomeServer/Workflows/`
- `outputs/HomeServer/Tools/`

### Step 6: Create SKILL.md

**Tool:** `Write` to `/outputs/HomeServer/SKILL.md`

**Decisions made:**
- YAML frontmatter: single-line description with USE WHEN clause containing 9 trigger phrases separated by OR
- Added note above routing table about SshConnect being internal
- Included the mandatory "read its file and follow the steps within it" instruction above the routing table
- 3 examples covering each user-facing workflow
- Trigger phrases are 2-4 words each, natural language, no overlap between workflows
- Description is 295 characters (well under 1024 limit)

### Step 7: Create Workflow Files

**Tool:** `Write` (4 calls, one per workflow file)

**CheckStatus.md:**
- References SshConnect in Reference Material
- 4-step workflow: connect, run health checks, report results, flag issues
- Includes specific commands (uptime, free, df, systemctl) and threshold values

**DeployUpdates.md:**
- References SshConnect in Reference Material
- 7-step workflow: connect, pre-deploy check, pull updates, build, restart, post-deploy verify, report
- Includes lock file checking and rollback awareness

**ViewLogs.md:**
- References SshConnect in Reference Material
- 5-step workflow: connect, determine log source, apply filters, retrieve/format, present
- Includes intent-to-flag mapping table for journalctl and docker compose

**SshConnect.md:**
- Marked as "Internal only -- called by other HomeServer workflows. Not user-invokable."
- Reference Material: None
- 4-step workflow: load config from env vars, build SSH command, test connection, return handle
- Uses environment variables (HOME_SERVER_HOST, HOME_SERVER_USER, HOME_SERVER_PORT, HOME_SERVER_KEY) for configuration

### Step 8: Generate SkillIntent.md

**Tool:** `Write` to `/outputs/HomeServer/SkillIntent.md`

**Decisions made:**
- First Principles: conversational management, DRY connection logic, observability vs mutability distinction
- Problem: eliminates need to remember SSH details and command syntax
- Design Decisions table: 4 rows covering SSH as internal workflow, not user-facing, three separate workflows, env-based config
- Out-of-Scope: provisioning, multi-server, firewall, user management, backup/restore
- Success Criteria: 5 binary-testable criteria (exceeds minimum 3)
- Constraints: env vars for SSH details, pre/post deploy health checks, bounded log output, SshConnect stays internal

**Testability gate passed:** All 5 success criteria are binary-testable, point to observable artifacts, and are atomic (no "and" conjunctions).

### Step 9: Verify

**Tool:** `Read` to re-read SKILL.md; `Bash` to list directory structure

Manual verification against the full SkillSystem.md validation checklist:

**Naming:** All pass -- TitleCase throughout (HomeServer, CheckStatus, DeployUpdates, ViewLogs, SshConnect)

**YAML Frontmatter:** All pass -- single-line description, USE WHEN clause present, intent-based language, 295 chars

**Markdown Body:** All pass -- Workflow Routing with table, "read its file" instruction, all refs resolve, 3 examples

**Structure:** All pass -- Tools/ exists (empty), no blocklisted dirs, all workflows have Reference Material, SkillIntent.md present

**Bidirectional integrity:** All pass -- 3 routing entries map to 3 files; SshConnect.md intentionally not in routing table (internal); all Reference Material refs valid

**SkillIntent completeness:** Pass -- file exists, Success Criteria section has 5 criteria (minimum 3)

**ValidateSkill.ts:** Could not run directly because the skill is in a workspace outputs directory, not under `$PAI_DIR/skills/`. Manual validation performed instead, covering all checks the validator would run.

## Summary

Created a complete HomeServer skill with 6 files across 3 directories. The skill has 3 user-facing workflows (CheckStatus, DeployUpdates, ViewLogs) and 1 internal workflow (SshConnect). All validation checks pass. Total tool calls: 16.
