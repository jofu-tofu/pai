# SecretScanning Workflow

**Purpose:** Scan directories for sensitive information, API keys, tokens, and credentials using TruffleHog.

**Triggers:** "check for secrets", "scan for credentials", "security scan", "find API keys", "audit for sensitive data"

---

## Platform Notes

All commands use `$PAI_DIR` for cross-platform compatibility:
- Works on macOS, Linux, and Windows (Git Bash/WSL)
- TruffleHog binary is automatically downloaded for your platform

---

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running secret scanning workflow"}' 2>/dev/null &
```

Running the **SecretScanning** workflow from the **System** skill...

---

## Tool Location

**Scanner:** `$PAI_DIR/skills/CORE/Tools/SecretScan.ts`

---

## Quick Commands

```bash
# Scan current directory
bun "$PAI_DIR/skills/CORE/Tools/SecretScan.ts"

# Scan specific directory
bun "$PAI_DIR/skills/CORE/Tools/SecretScan.ts" /path/to/project

# Verbose output (show redacted secrets)
bun "$PAI_DIR/skills/CORE/Tools/SecretScan.ts" /path/to/project --verbose

# JSON output for parsing
bun "$PAI_DIR/skills/CORE/Tools/SecretScan.ts" /path/to/project --json

# Verify if credentials are active
bun "$PAI_DIR/skills/CORE/Tools/SecretScan.ts" /path/to/project --verify
```

---

## What It Detects

TruffleHog detects 700+ credential types:

| Category | Examples |
|----------|----------|
| Cloud Providers | AWS, GCP, Azure keys |
| AI Services | OpenAI, Anthropic, Hugging Face |
| Payment | Stripe, PayPal, Square |
| Version Control | GitHub, GitLab, Bitbucket tokens |
| Communication | Slack, Discord, Twilio |
| Database | MongoDB, PostgreSQL connection strings |
| Other | OAuth tokens, private keys, JWTs |

---

## Common Use Cases

### 1. Pre-Commit Check

Before pushing to any repository:

```bash
bun "$PAI_DIR/skills/CORE/Tools/SecretScan.ts" .
```

### 2. Audit Private PAI Instance

```bash
bun "$PAI_DIR/skills/CORE/Tools/SecretScan.ts" "$PAI_DIR" --verbose
```

### 3. Audit Public PAI Before Push

**CRITICAL - Always run before pushing to public PAI:**

```bash
# Replace with your public PAI repository path
bun "$PAI_DIR/skills/CORE/Tools/SecretScan.ts" "$HOME/Projects/PAI" --verbose
```

### 4. Full Verification (Active Credential Check)

```bash
bun "$PAI_DIR/skills/CORE/Tools/SecretScan.ts" . --verify
```

---

## Output Interpretation

### Clean Scan
```
Scanning: /path/to/project
No sensitive information found!
```

### Secrets Found
```
Found 3 potential secrets:

VERIFIED SECRETS (ACTIVE CREDENTIALS!)
  File: .env.example
  Type: AWS
  Line: 5
  Fix: Rotate via AWS IAM immediately

POTENTIAL SECRETS (Unverified)
  File: config/dev.json
  Type: Generic API Key
  Line: 12
  Fix: Remove from code, use env vars
```

---

## Remediation Steps

When secrets are found:

1. **Immediate:** Rotate/revoke the credential at its source
2. **Check:** Audit logs for unauthorized access
3. **Remove:** Delete from code AND git history
4. **Replace:** Move to environment variables or secret vault
5. **Prevent:** Add pre-commit hooks

### Removing from Git History

```bash
# Using BFG (recommended)
# macOS: brew install bfg
# Linux: apt install bfg or download from https://rtyley.github.io/bfg-repo-cleaner/
bfg --delete-files .env
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

---

## Integration with Other Workflows

- **CrossRepoValidation** - Calls this workflow automatically
- **PrivateSystemAudit** - Includes security component
- **PAI skill** - Run before any public push

---

## Requirements

**TruffleHog is auto-downloaded on first use.**

The PAI system includes a cross-platform wrapper that automatically downloads the appropriate TruffleHog binary:

```bash
# The wrapper handles download automatically
bun "$PAI_DIR/bin/trufflehog.ts" filesystem /path/to/scan

# Force re-download if needed
bun "$PAI_DIR/bin/trufflehog-download.ts" --force
```

Supports Windows, macOS (Intel and ARM), and Linux.

---

## Related Workflows

- `CrossRepoValidation.md` - Full private/public separation check
- `PrivateSystemAudit.md` - Comprehensive system audit
