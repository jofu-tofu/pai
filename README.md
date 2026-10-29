# Standalone agent skills

Copy a complete directory containing SKILL.md into your agent's skill location. Read SKILL.md and PORTABILITY.md. No PAI or LifeOS setup, hooks, global memory service or shared runtime is required. Keep the included license and SOURCE.md.

- skills/Thinking/: BeCreative, Council, FirstPrinciples, IterativeDepth, RedTeam and Science.
- skills/Utilities/: Browser, Evals, Fabric and Prompting.
- skills/Agents/, System/, Telos/, SkillTranslate/, Upgrades/, Webdesign/, humanizer/, handoff/, handoff-resume/, meta-plan/ and PAI/ provide independent workflows.

Thinking and Utilities are optional routers. PAI is now a compact problem-solving guide, not an installed operating system. Original system files remain recoverable in Git history. Other legacy repository runtime files are not needed by these skills.

Prompt-led workflows use the current host's tools. Optional executable tools use Bun; install package.json dependencies within the copied skill when present. Telos uses an explicitly selected TELOS_DIR. Evals model grading uses an explicit EVAL_COMMAND executable and optional EVAL_ARGS JSON array; it never discovers a global provider account. Fabric's local checks run offline. Optional Next.js templates have their own packages. Browser automation additionally needs Playwright browser binaries.

Run bun test ./tests/standalone-skills.test.ts for copy-isolation, dependency-boundary and data-safety checks. These are portability checks, not model-quality benchmarks. Upstream scores do not establish the quality of these adapted versions. Custom Research in the separate skills repository is unchanged.
