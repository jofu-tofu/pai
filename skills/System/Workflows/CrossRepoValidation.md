# CrossRepoValidation Workflow

**Purpose:** Validate separation between private PAI instance ($PAI_DIR) and public PAI repository. Ensures no sensitive data leaks to public repo and references between systems are consistent.

**Triggers:** "cross-repo validation", "check for leaks", "validate repo separation", "verify nothing sensitive in public"

---

## Platform Notes

All commands use `$PAI_DIR` and `$HOME` for cross-platform compatibility:
- Works on macOS, Linux, and Windows (Git Bash/WSL)
- Avoid `~` expansion - always use environment variables

---

## Critical Paths

| Repository | Path | Purpose |
|------------|------|---------|
| **Private** | `$PAI_DIR` | Personal PAI instance with sensitive config |
| **Public** | `$HOME/Projects/PAI` | Open source PAI template for community |

**RULE:** Content must NEVER flow from private to public without explicit sanitization.

---

## Execution

### Step 1: Verify Repository Locations

```bash
# Confirm both repos exist and are distinct
echo "=== Private PAI ==="
cd "$PAI_DIR" && pwd && git remote -v

echo ""
echo "=== Public PAI ==="
PUBLIC_PAI="$HOME/Projects/PAI"
if [ -d "$PUBLIC_PAI" ]; then
  cd "$PUBLIC_PAI" && pwd && git remote -v
else
  echo "Public PAI not found at $PUBLIC_PAI"
fi
```

**Expected:**
- Private: No public remote (or private GitHub)
- Public: `github.com/danielmiessler/PAI`

### Step 2: Secret Scan Public Repo

```bash
# CRITICAL: Scan public repo for any leaked secrets
PUBLIC_PAI="$HOME/Projects/PAI"
if [ -d "$PUBLIC_PAI" ]; then
  bun "$PAI_DIR/skills/PAI/Tools/SecretScan.ts" "$PUBLIC_PAI" --verbose
fi
```

**Must return:** "No sensitive information found!"

### Step 3: Check for Private Path References

```bash
PUBLIC_PAI="$HOME/Projects/PAI"
if [ -d "$PUBLIC_PAI" ]; then
  cd "$PUBLIC_PAI"

  echo "=== Checking for private paths ==="
  # Look for hardcoded home directory references (should NOT exist in public)
  if grep -r "\$HOME/\." . --exclude-dir=.git --exclude-dir=node_modules 2>/dev/null | grep -v "example"; then
    echo "FOUND: hardcoded home path"
  else
    echo "Clean: no hardcoded home paths"
  fi

  # Look for tilde paths (should use $PAI_DIR instead)
  if grep -r "~/\." . --exclude-dir=.git --exclude-dir=node_modules 2>/dev/null | grep -v "example\|README"; then
    echo "FOUND: tilde paths"
  else
    echo "Clean: no tilde paths"
  fi

  # Look for private email (replace with your domain if applicable)
  if grep -r "@yourdomain.com" . --exclude-dir=.git --exclude-dir=node_modules 2>/dev/null; then
    echo "FOUND: private email"
  else
    echo "Clean: no private emails"
  fi
fi
```

**Expected:** All "Clean"

### Step 4: Check for Hardcoded Identities

```bash
PUBLIC_PAI="$HOME/Projects/PAI"
if [ -d "$PUBLIC_PAI" ]; then
  cd "$PUBLIC_PAI"

  echo "=== Checking for hardcoded identities ==="
  # Should use {daidentity.name} or {principal.name} placeholders
  grep -r '"Kai"' . --exclude-dir=.git --exclude-dir=node_modules 2>/dev/null | grep -v example
  grep -r '"Daniel"' . --exclude-dir=.git --exclude-dir=node_modules 2>/dev/null | grep -v example
fi
```

**Expected:** Only in example contexts, not hardcoded

### Step 5: Validate Pack Structure Matches

```bash
# Compare pack structure between private skills and public packs
echo "=== Private Skills ==="
ls "$PAI_DIR/skills/" 2>/dev/null | grep -v "^_" | grep -v "^\." | head -20

echo ""
echo "=== Public Packs ==="
PUBLIC_PAI="$HOME/Projects/PAI"
if [ -d "$PUBLIC_PAI/Packs" ]; then
  ls "$PUBLIC_PAI/Packs/" | head -20
fi
```

Note any packs that should exist in public but don't (or vice versa).

### Step 6: Check for Sensitive File Types

```bash
PUBLIC_PAI="$HOME/Projects/PAI"
if [ -d "$PUBLIC_PAI" ]; then
  cd "$PUBLIC_PAI"

  echo "=== Checking for sensitive file types ==="
  # These should NEVER exist in public repo
  find . -name ".env" -not -path "./.git/*" 2>/dev/null && echo "FOUND .env" || echo "No .env"
  find . -name "*.pem" -not -path "./.git/*" 2>/dev/null && echo "FOUND .pem" || echo "No .pem"
  find . -name "credentials.json" -not -path "./.git/*" 2>/dev/null && echo "FOUND credentials" || echo "No credentials"
  find . -name "*.key" -not -path "./.git/*" 2>/dev/null && echo "FOUND .key" || echo "No .key"
  find . -name "settings.json" -not -path "./.git/*" 2>/dev/null && echo "FOUND settings.json" || echo "No settings.json"
fi
```

**Expected:** All "No [type]"

### Step 7: Validate gitignore Coverage

```bash
PUBLIC_PAI="$HOME/Projects/PAI"
if [ -d "$PUBLIC_PAI" ]; then
  cd "$PUBLIC_PAI"

  echo "=== Public .gitignore ==="
  if [ -f .gitignore ]; then
    cat .gitignore | grep -E "\.env|\.pem|credentials|settings\.json" || echo "Missing critical entries!"
  else
    echo "WARNING: No .gitignore found!"
  fi
fi
```

**Required entries:**
- `.env*`
- `*.pem`
- `credentials.json`
- `settings.json`

---

## Report Format

```markdown
# Cross-Repository Validation Report

**Date:** [DATE]
**Private Repo:** $PAI_DIR
**Public Repo:** $HOME/Projects/PAI

## Security Checks

| Check | Status | Details |
|-------|--------|---------|
| Secret Scan | [PASS/FAIL] | [Details] |
| Private Paths | [PASS/FAIL] | [Count found] |
| Hardcoded Identity | [PASS/FAIL] | [Count found] |
| Sensitive Files | [PASS/FAIL] | [Files found] |
| Gitignore | [PASS/FAIL] | [Missing entries] |

## Issues Found

### Critical (Block Push)
- [List any critical issues]

### Warnings (Review Before Push)
- [List any warnings]

## Recommendations
- [Suggestions for improvement]

## Overall Status: [SAFE TO PUSH | NEEDS ATTENTION | BLOCKED]
```

---

## When This Workflow Fails

If ANY critical check fails:

1. **DO NOT PUSH** to public repository
2. Identify the leaked/sensitive content
3. Remove from public repo
4. If already pushed, remove from git history using BFG
5. Re-run validation until all checks pass

---

---

## Related Workflows

- `SecretScanning.md` - Detailed secret detection
- `PrivateSystemAudit.md` - Full private system audit
- PAI skill → `PAIIntegrityCheck.md` - Public pack validation
