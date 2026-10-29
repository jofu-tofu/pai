---
name: Browser
description: Debug-first browser automation for Playwright page verification and frontend troubleshooting. Console logs, network failures, screenshots, and accessibility snapshots are part of the primary workflow. USE WHEN verify UI, debug web, inspect rendered page, troubleshoot frontend, take browser screenshot, or reproduce a browser issue.
compatibility: Designed for Claude Code and Devin (or similar agent products). Requires Playwright.
metadata:
  author: pai
  version: "2.0.0"
---

Read `PORTABILITY.md` before use; it defines the standalone tool and storage contract and replaces any inherited platform-specific setup.

# Browser

Debug-first Playwright automation for seeing the rendered page, collecting diagnostics, and verifying browser behavior before you claim a web change works.

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

| Workflow | Trigger | File |
|----------|---------|------|
| **VerifyPage** | "verify page", "check page", "debug page load" | `Workflows/VerifyPage.md` |
| **Screenshot** | "take screenshot", "capture page", "browser screenshot" | `Workflows/Screenshot.md` |
| **Interact** | "reproduce browser flow", "fill form", "click through page" | `Workflows/Interact.md` |

## Examples

**Example 1: Verify a frontend change**
```
User: "Verify the settings page loads without browser errors"
-> Invokes VerifyPage workflow
-> Runs the diagnostic-first Browser flow against the page
-> Returns screenshot-backed verification plus any console/network issues
```

**Example 2: Debug a broken page**
```
User: "Debug why the users page is blank"
-> Invokes VerifyPage workflow
-> Loads the page with diagnostics enabled
-> Uses console and failed request output to identify the breakage
```

**Example 3: Reproduce a form flow before verifying**
```
User: "Fill the login form and verify the dashboard loads"
-> Invokes Interact workflow
-> Uses minimal browser interactions to reach the target state
-> Finishes with verification evidence from the rendered dashboard
```

## Execution Notes

- Check for Browser customizations at `Customizations/` before running the skill.
- If `Customizations/` exists, read it first for selectors, auth notes, dev-server URLs, and known quirks.
- Start with `bun run <skill-dir> <url>` whenever you need the clearest diagnostic picture.
- Use `a11y` when text structure is enough; use screenshots when visual proof matters.
- Use `click`, `fill`, and `type` only to reach the state you need to inspect or verify.
- If the page shows console errors or failed requests, report them instead of claiming success.

## Public Command Surface

```bash
bun run <skill-dir> <url>
bun run <skill-dir> a11y
bun run <skill-dir> errors
bun run <skill-dir> console
bun run <skill-dir> network
bun run <skill-dir> failed
bun run <skill-dir> screenshot [path]
bun run <skill-dir> click <selector>
bun run <skill-dir> fill <selector> <value>
bun run <skill-dir> type <selector> <text>
bun run <skill-dir> status
bun run <skill-dir> restart
bun run <skill-dir> stop
```

## Verification Standard

Run the Browser skill against the rendered page before you call a web change verified. Screenshot evidence and diagnostics are the default proof, not optional extras.
