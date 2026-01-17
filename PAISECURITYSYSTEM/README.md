# PAI Security System - System Defaults

This directory contains the **system-tier** security configuration that serves as the fallback when user-specific security patterns are not configured.

## Two-Tier Architecture

| Tier | Location | Purpose |
|------|----------|---------|
| **USER** | `skills/CORE/USER/PAISECURITYSYSTEM/` | Personal customizations (never synced) |
| **SYSTEM** | `PAISECURITYSYSTEM/` (this directory) | Default fallback patterns |

## Files

- `patterns.example.yaml` - Default security patterns used when USER patterns are missing or corrupted

## How It Works

1. `SecurityValidator.hook.ts` first checks for USER patterns at `skills/CORE/USER/PAISECURITYSYSTEM/patterns.yaml`
2. If USER patterns don't exist or fail to load, it falls back to this directory's `patterns.example.yaml`
3. This ensures security is **never disabled** even if user configuration is missing

## Security Philosophy

- **Block** catastrophic/irreversible operations (rm -rf /, gh repo delete)
- **Confirm** dangerous but legitimate operations (git push --force, terraform destroy)
- **Alert** suspicious but allowed operations (curl | sh)
- **Allow** everything else without friction

## Customization

To customize security patterns:
1. Copy `patterns.example.yaml` to `skills/CORE/USER/PAISECURITYSYSTEM/patterns.yaml`
2. Modify the USER copy to match your environment
3. The USER patterns will take priority over these defaults

## Related Documentation

- `skills/CORE/USER/PAISECURITYSYSTEM/ARCHITECTURE.md` - Full security architecture
- `skills/CORE/USER/PAISECURITYSYSTEM/QUICKREF.md` - Quick reference
- `hooks/SecurityValidator.hook.ts` - Hook implementation
