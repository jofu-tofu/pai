# DesignRationale

Design decisions for ContextLayer. Not loaded at runtime — for future maintainers.
Records Science hypothesis verdicts and RedTeam attack outcomes that shaped the design.

---

## Science Hypothesis Verdicts (H1–H6)

| Hypothesis | Verdict | Evidence Summary |
|-----------|---------|-----------------|
| H1: Build/test commands are highest-value content | **CONFIRMED** | Commands prevent immediate agent failure (wrong runtime, wrong entry point); conventions drift more slowly and agent can sometimes recover |
| H2: package.json + README + file tree = 80% of useful content | **REFUTED** | Coverage is ~60-70%; conventions, prohibitions, and non-obvious patterns require reading actual source files — metadata alone is insufficient |
| H3: Inline cross-boundary summaries > file-path references | **CONFIRMED (with caveat)** | Agents don't follow "See: path" references; inline summaries are immediately consumed. Caveat: summaries rot when the code changes, requiring Audit workflow to specifically target them |
| H4: Embedded pruning instruction reduces context rot | **CONFIRMED (limited scope)** | Agents DO follow embedded meta-instructions; Phase 1 bridge is effective. Limitation: only works when agent is actively in the file, not autonomous |
| H5: Falsifiability test is best pruning heuristic | **CONFIRMED (with amendment)** | Excellent primary heuristic but misses infrequent-but-critical project-specific rules. Amendment: secondary heuristic added — keep if removing causes wrong behavior even 10% of the time in this specific project |
| H6: Prune/Audit should only scan what CLAUDE.md references | **CONFIRMED (split verdict)** | Prune: fully confirmed — content-only analysis needs no filesystem reads. Audit: confirmed but nuanced — scans only files referenced in the CLAUDE.md being audited, not the full project |

---

## RedTeam Attack Outcomes

| Attack | Severity | Design Response |
|--------|----------|----------------|
| Auto-apply is unsafe — CLAUDE.md is agent control plane, not documentation | Critical | Noted and documented. Plan explicitly requires no-confirmation for friction reduction (reversible via git). Phase 2 will add diff-display before apply. |
| Falsifiability instruction has no enforcement mechanism | Critical | Acknowledged as design limitation of Phase 1. Embedded instruction is passive; Prune + Audit workflows are primary enforcement. Phase 2/3 hooks will automate. |
| Prune workflow solves wrong problem — can't detect external staleness | Significant | Confirmed by design. Prune = content quality only (redundancy, verbosity, obviousness). Audit = external accuracy. The separation is intentional and correct. |
| Subsystem decomposition is underspecified | Significant | Addressed in ScanProtocol.md: default to directory-level decomposition; any dir with 3+ files gets its own haiku agent |
| Haiku capability insufficient for complex subsystems | Moderate | Documented as assumption. Fallback: orchestrator reads subsystem directly if haiku agent fails twice. Haiku is adequate for most subsystems; complex cases degrade gracefully. |
| Fixed token budgets can't adapt to subsystem complexity | Moderate | Noted. Budget model has headroom (~450 tokens) for root CLAUDE.md. Complex subsystems can use more of that headroom; simple ones will naturally produce less. Not solved perfectly. |
| No error handling for partial agent failures | Moderate | Added retry (1x) + orchestrator fallback to HaikuAgentPattern.md |

---

## Live Stress Test Results (2026-02-17)

Five scenarios run against the PAI codebase using real parallel haiku agent dispatch. Findings drove 4 patches to skill files.

| Scenario | Outcome | Patch Applied |
|----------|---------|--------------|
| S1: Prune on root CLAUDE.md | **PASS** — Falsifiability test correctly protected "read DEVELOPMENT.md first" imperative; imperative vs. passive-reference distinction holds | None — design confirmed |
| S2: Audit on root CLAUDE.md | **Partial** — Zero stale entries correct, but 8 "missing" entries would have been over-added from DEVELOPMENT.md (delegation pattern hole) | `Audit.md` Step 4: delegation check added — don't add entries that belong in intentionally delegated files |
| S3: Haiku agent dispatch | **Retry required** — Both dispatched agents returned markdown fences despite explicit "no fences" instruction; content was correct, format failed | `HaikuAgentPattern.md`: Step 0 fence-strip added before JSON.parse(); retry protocol confirmed to work |
| S4: Generate overwrite behavior | **Hole confirmed** — Generate.md had no explicit "overwrite vs. merge" instruction for existing CLAUDE.md files | `Generate.md` Step 6: explicit overwrite behavior documented |
| S5: Scale cap | **Hole confirmed** — No agent cap; PAI's 31 skill subdirectories would have triggered 31 simultaneous haiku agents | `ScanProtocol.md`: 8-agent batch cap added with priority rule (most files first) |

**Additional finding:** Haiku agents consistently use absolute paths in `key_files` despite schema example showing relative paths. Schema now explicitly requires relative paths and Output Validation Step 4 strips project root prefix.

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Parallel haiku agents (not sequential) | Correctness requires reading actual files; parallelism keeps wall-clock time acceptable |
| JSON intermediate representation | Validated, parseable, and separates agent output from synthesis — same pattern as compiler IR |
| Two-tier budgets (root vs subdir) | Root needs global context; subdirs need only local context — different audiences, different budgets |
| Tiered cost model (Generate > Audit > Prune) | Aligns expensive operations with low frequency; Prune is cheapest because it reads no source files |
| Auto-apply (Phase 1) | Explicit user requirement: friction reduction. Changes are reversible via git. Phase 2 adds diff-display. |
| No DocPhilosophy runtime dependency | It's a thinking tool; baking its concepts into static files saves tokens on every invocation |
| Context layer = tree, not single file | Hierarchical context: root for global orientation, subdirs for scoped domain context |
