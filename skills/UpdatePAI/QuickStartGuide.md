# UpdatePAI Quick Start

Autonomous PAI system updates with minimal user decisions.

## Usage

Say "Update PAI" to start. The AutoUpdate workflow handles everything automatically.

**You decide only:**
1. DAIDENTITY configuration (if new)
2. Install new packs? (only NEW packs)
3. Final approval

**Automated:**
- Version detection and analysis
- Backup creation
- Custom skill preservation
- History migration
- Settings merge
- Path updates
- Verification

## Workflows

| Workflow | Use When |
|----------|----------|
| **AutoUpdate** | Standard update (default) |
| **Analyze** | Check changes before updating |
| **Backup** | Create safety backup |
| **HybridUpdate** | Manual control preferred |
| **FreshInstall** | Corrupted installation |
| **Verify** | Check installation health |

## Prerequisites

- Repository clone at `C:\EpicSource\Github\Personal_AI_Infrastructure`
- Run `git pull` for latest version
- `jq` installed for JSON processing

## Rollback

If issues occur after update:
```bash
~/pai-backups/pai-backup-YYYYMMDD-HHMMSS/rollback.sh
```

## Support

**Repository:** https://github.com/danielmiessler/Personal_AI_Infrastructure
