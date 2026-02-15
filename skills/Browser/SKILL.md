---
name: Browser
description: Debug-first browser automation with always-on visibility. Console logs, network requests, and errors captured by default. USE WHEN browser, screenshot, debug web, verify UI, troubleshoot frontend.
version: 2.0.0
---

## Customization

**Before executing, check for user customizations at:**
`$PAI_DIR/skills/PAI/USER/SKILLCUSTOMIZATIONS/Browser/`

If this directory exists, load and apply any PREFERENCES.md, configurations, or resources found there. These override default behavior. If the directory does not exist, proceed with skill defaults.


# Browser v2.0.0 - Debug-First Browser Automation

**Debugging visibility by DEFAULT.** Console logs, network requests, and errors are always captured. No opt-in required.

---

## Philosophy

Debugging shouldn't be opt-in. Like good logging frameworks - you don't turn on logging when you have a problem, you have it enabled from the start so the data exists when problems occur.

**Visible by default.** All automation runs with browser window VISIBLE for debugging. This is intentional - you can see exactly what's happening.

**v2.0.0 Changes:**
- Session auto-starts on first use (no explicit `session start`)
- Console and network capture always enabled
- Diagnostic output included by default
- 30-minute idle timeout (auto-cleanup)
- New primary command: `Browse.ts <url>` for full diagnostics
- Windows-compatible (cross-platform temp paths)

---

## Quick Start

```bash
# Navigate with full diagnostics (PRIMARY COMMAND)
bun run $PAI_DIR/skills/Browser/Tools/Browse.ts https://example.com

# Output:
# Screenshot: C:\Users\...\AppData\Local\Temp\browse-1704614400.png
# Console Errors (2): ...
# Failed Requests (1): ...
# Network: 34 requests | 1.2MB | avg 120ms
# Page: "Example" loaded successfully
```

Session auto-starts. No setup needed.

---

## Commands

### Primary - Navigate with Diagnostics

```bash
bun run Browse.ts <url>
```

Navigates to URL, takes screenshot, and reports:
- Console errors and warnings
- Failed network requests (4xx, 5xx)
- Network statistics
- Page load status

### Query Commands

```bash
bun run Browse.ts errors      # Console errors only
bun run Browse.ts warnings    # Console warnings only
bun run Browse.ts console     # All console output
bun run Browse.ts network     # All network activity
bun run Browse.ts failed      # Failed requests only (4xx, 5xx)
```

### Interaction Commands

```bash
bun run Browse.ts click <selector>           # Click element
bun run Browse.ts fill <selector> <value>    # Fill input
bun run Browse.ts type <selector> <text>     # Type with delay
bun run Browse.ts screenshot [path]          # Take screenshot
bun run Browse.ts navigate <url>             # Navigate without report
bun run Browse.ts eval "<javascript>"        # Execute JavaScript
bun run Browse.ts open <url>                 # Open in user's default browser
```

### Management Commands

```bash
bun run Browse.ts status      # Session info
bun run Browse.ts restart     # Fresh session (clears logs)
bun run Browse.ts stop        # Stop session (rarely needed)
```

---

## Debugging Workflow

**Scenario: "Why isn't the user list loading?"**

```bash
# Step 1: Load the page
$ bun run Browse.ts https://myapp.com/users

Screenshot: C:\Users\...\AppData\Local\Temp\browse-xxx.png

Console Errors (1):
   - TypeError: Cannot read property 'map' of undefined

Failed Requests (1):
   - GET /api/users -> 500 Internal Server Error

Network: 23 requests | 847KB | avg 89ms
Page: "Users" loaded with issues
```

**Immediately know:**
1. API returning 500
2. Frontend JS crashing because no data
3. Specific error location

**Step 2: Dig deeper**

```bash
# Full console output
$ bun run Browse.ts console

# All network activity
$ bun run Browse.ts network

# Just the failures
$ bun run Browse.ts failed
```

---

## Architecture

### Auto-Start Session

First command auto-starts a persistent browser session:

```
Any command -> ensureSession() -> Session running?
                                    +- Yes -> Execute command
                                    +- No -> Start session -> Execute command
```

No explicit `session start` needed.

### Always-On Event Capture

From the moment the browser launches:
- **Console logs** - All `console.log`, `console.error`, etc.
- **Network requests** - Every request with headers, timing, size
- **Network responses** - Status codes, response times, sizes
- **Page errors** - Uncaught exceptions, promise rejections

### Idle Timeout

Session auto-closes after 30 minutes of inactivity:
- No zombie processes
- No manual cleanup needed
- Restarts automatically on next command

---

## Comparison to v1.x

| Aspect | v1.x | v2.0.0 |
|--------|------|--------|
| Session management | Manual `session start/stop` | Automatic |
| Console capture | Only in session mode | Always |
| Network capture | Only in session mode | Always |
| Error visibility | Must query explicitly | Default in output |
| Idle cleanup | Manual stop | Auto 30-min timeout |
| Primary command | `screenshot <url>` | `<url>` (full diagnostic) |

---

## API Reference

### CLI Tool

**Location:** `$PAI_DIR/skills/Browser/Tools/Browse.ts`

| Command | Description |
|---------|-------------|
| `<url>` | Navigate with full diagnostics |
| `errors` | Show console errors |
| `warnings` | Show console warnings |
| `console` | Show all console output |
| `network` | Show network activity |
| `failed` | Show failed requests |
| `screenshot [path]` | Take screenshot |
| `navigate <url>` | Navigate without report |
| `click <selector>` | Click element |
| `fill <sel> <val>` | Fill input |
| `type <sel> <text>` | Type with delay |
| `eval "<js>"` | Execute JavaScript |
| `open <url>` | Open in user's default browser |
| `status` | Session info |
| `restart` | Fresh session |
| `stop` | Stop session |

### Server Endpoints

**Location:** `$PAI_DIR/skills/Browser/Tools/BrowserSession.ts`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/diagnostics` | GET | Full diagnostic summary |
| `/console` | GET | Console logs |
| `/network` | GET | Network logs |
| `/health` | GET | Health check |
| `/session` | GET | Session info |
| `/navigate` | POST | Navigate (clears logs) |
| `/click` | POST | Click element |
| `/fill` | POST | Fill input |
| `/screenshot` | POST | Take screenshot |
| `/evaluate` | POST | Run JavaScript |
| `/stop` | POST | Stop server |

---

## TypeScript API

For complex automation, use the TypeScript API directly:

```typescript
import { PlaywrightBrowser } from '$PAI_DIR/skills/Browser/index.ts'

const browser = new PlaywrightBrowser()
await browser.launch({ headless: false })  // Visible by default
await browser.navigate('https://example.com')

// Get diagnostics
const errors = browser.getConsoleLogs({ type: 'error' })
const failed = browser.getNetworkLogs({ status: [400, 404, 500] })
const stats = browser.getNetworkStats()

await browser.close()
```

**Full API:** See `index.ts` for all methods.

---

## VERIFY Phase Integration

**MANDATORY for verifying web changes:**

```bash
# Before claiming any web change is "live" or "working":
bun run Browse.ts https://example.com/changed-page

# Check the screenshot AND diagnostics
# If errors or failed requests exist, the change is NOT verified
```

**If you haven't LOOKED at the rendered page and its diagnostics, you CANNOT claim it works.**
