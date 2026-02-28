# SkillIntent — Browser

## Problem This Skill Solves

AI agents need to verify web changes, debug frontend issues, and interact with pages. Without this skill, agents either cannot see rendered pages or rely on token-expensive screenshot-only workflows. The Browser skill provides debug-first browser automation with always-on console/network capture, accessibility tree output for token-efficient page understanding, and comprehensive error handling for common setup failures.

## Success Criteria

1. **Debug visibility by default** — Console errors, network failures, and page state are captured from the moment the browser launches. No opt-in required.
2. **Token-efficient page understanding** — Accessibility tree output (via `a11y` command and auto-appended after interactions) provides structured text page representation, reducing reliance on screenshot tokens.
3. **Headed mode by default** — Browser window is visible for debugging. Headless available via `--headless` flag.
4. **Actionable error messages** — Common failures (Playwright not installed, port conflicts, session timeouts) produce specific error messages with exact fix commands.
5. **Auto-session management** — Session starts on first use, auto-closes after 30min idle. No manual start/stop ceremony.
6. **Cross-platform** — Works on Linux, macOS, and Windows (Bun + Node/tsx fallback).
7. **Full interaction support** — Click, fill, type, select, hover, drag, keyboard, iframe interaction all available via CLI and API.

## Constraints

- **No MCP dependency** — Uses direct Playwright APIs, not the Playwright MCP server.
- **Single active session** — Only one browser session runs at a time (port 9222).
- **Accessibility tree max 200 lines** — Output is truncated to prevent context window overflow.
- **Playwright must be installed separately** — Not bundled; user runs `npx playwright install chromium`.

## Design Decisions

1. **Client-server architecture** — BrowserSession.ts runs as a persistent HTTP server, Browse.ts is the CLI client. This allows session persistence across commands.
2. **ariaSnapshot for a11y tree** — Uses Playwright's built-in `ariaSnapshot()` rather than custom tree walking, for reliability and standards compliance.
3. **Always-on event capture** — Console and network listeners attached at launch, not on-demand. Data exists when you need it.
4. **Debug-first, not test-first** — Philosophy prioritizes visibility and diagnostics over test assertion patterns.
