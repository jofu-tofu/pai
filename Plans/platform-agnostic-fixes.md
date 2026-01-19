# Platform-Agnostic Fixes Plan

## Overview
Fix 32 platform-specific issues to make PAI work consistently across Windows, macOS, and Linux.

---

## Group 1: Hooks Fixes

### 1.1 notifications.ts
- **Line 142**: Replace `/tmp/kai-session-start.txt` with `join(tmpdir(), 'kai-session-start.txt')`
- **Lines 313-314**: Guard `osascript` with `process.platform === 'darwin'` check
- **Lines 100-104**: Expand `expandEnvVars()` to handle `%VAR%` Windows syntax

### 1.2 LoadContext.hook.ts
- **Line 62**: Replace `date` command with cross-platform JavaScript Date API
```typescript
// Replace Bun.spawn(['date', ...]) with:
const now = new Date();
const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: process.env.TIME_ZONE || 'America/Los_Angeles',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
  timeZoneName: 'short'
});
return formatter.format(now);
```

### 1.3 UpdateTabTitle.hook.ts
- **Lines 263-265**: Guard `printf` commands with platform check
- **Lines 280-281**: Replace `curl` shell command with `fetch()` API

---

## Group 2: Tools Fixes

### 2.1 Banner.ts (skills/CORE/tools/)
- **Lines 24-26**: Update regex to handle both `/` and `\` separators: `(?=[\/\\]|$)`
- **Lines 62-72**: Guard `sh`, `stty`, `tput` with `process.platform !== 'win32'`
- **Line 182**: Add Windows-friendly platform name: `process.platform === "win32" ? "Windows" : ...`
- Use `process.stdout.columns` as cross-platform fallback for terminal width

### 2.2 FeatureRegistry.ts, SessionProgress.ts
- **Line 45/46**: Fix HOME/USERPROFILE order:
```typescript
const PAI_DIR = process.env.PAI_DIR || process.env.PAI_HOME ||
  join(process.env.HOME || process.env.USERPROFILE || '', '.claude');
```

### 2.3 SkillSearch.ts, GenerateSkillIndex.ts (tools/)
- Add `USERPROFILE` fallback for Windows
- **GenerateSkillIndex.ts line 83**: Use `path.relative()` instead of hardcoded `/` replace

---

## Group 3: Skills Fixes

### 3.1 RenderTemplate.ts (skills/Prompting/Tools/)
- **Line 168**: Replace `ls` command with `readdirSync()`:
```typescript
import { readdirSync } from 'fs';
const files = readdirSync(partialsDir).filter(f => f.endsWith('.hbs'));
```

### 3.2 telos-data.ts (skills/Telos/)
- **Line 58**: Use `path.join('data', filename)` instead of template literal with `/`

---

## Group 4: Bin Scripts Fixes

### 4.1 Shebang Fixes
- `scripts/statusline.sh` line 1: Change `#!/bin/bash` → `#!/usr/bin/env bash`
- `skills/UpdatePAI/Tools/DetectVersion.sh` line 1: Change `#!/bin/bash` → `#!/usr/bin/env bash`

### 4.2 sed -i Inconsistency (update-env-var.sh)
Create helper function for cross-platform sed:
```bash
sed_inplace() {
    local pattern="$1" file="$2"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "$pattern" "$file"
    else
        sed -i "$pattern" "$file"
    fi
}
```
Apply to lines 59, 64, 71, 101, 117.

---

## Implementation Order
1. **Group 2 (Tools)** - Most foundational, affects other components
2. **Group 1 (Hooks)** - High visibility, affects every session
3. **Group 3 (Skills)** - Specific functionality
4. **Group 4 (Scripts)** - Shell scripts, separate concern

---

## Success Criteria
- [ ] All TypeScript compiles without errors
- [ ] PAI starts successfully on Windows
- [ ] PAI starts successfully on macOS
- [ ] PAI starts successfully on Linux
- [ ] No `/tmp`, `osascript`, `date`, `ls`, `stty` commands fail on wrong platform
