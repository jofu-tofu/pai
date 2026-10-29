# Standalone skills

Each directory containing SKILL.md is a portable unit. Copy the whole directory; load SKILL.md and PORTABILITY.md. Thinking and Utilities are optional category routers, not prerequisites. Their child skills can be copied individually.

This adaptation removes global setup and runtime assumptions. The old PAI system core is replaced by a task-scoped problem-solving guide; the original is recoverable in Git history before this change. Telos safety helpers are included locally. Model calls use host tools; Evals accepts EVAL_COMMAND and EVAL_ARGS for an explicitly selected executable adapter. Fabric's PortDuel summarizes supplied, independently judged comparison verdicts; its code checkers and held-out cases remain available. No benchmark of these adapted versions is claimed.

Research in the separate skills repository was excluded and remains unchanged. No personal notes or TELOS data are bundled.

## Verification

23 skill entrypoints parse as YAML. Nine offline portability and data-safety tests pass, including independent copied folders, import confinement, Telos concurrency/backups and guarded regions. Both optional Telos Next.js templates build. Agents trait listing, Prompting render/validate help and rendering, Evals suite help, and translation mappings run with local packages. Fabric checks 275 patterns. Legacy SkillForge conventions still flag lowercase established names and missing Tools directories on prompt-only skills; these are not runtime dependencies. No live-provider quality benchmark was run. Optional dashboard AI chat is deliberately unavailable; use the host assistant. Original core runtime files were removed from the PAI skill and remain recoverable in Git history.
