# ViewModels

Read and report horizon model coverage and freshness without modifying files.

Read PORTABILITY.md. Ask for or reuse an explicitly supplied models directory; otherwise use a task-local world-models/ directory and report it. Never read or write a global memory tree. Horizons are 6 months, 1, 2, 3, 5, 7, 10, 15, 20, 30 and 50 years. Keep an INDEX.md with each horizon filename and last_updated date. Alternative scenarios live in Scenarios/.

Use References/WorldModelTemplate.md for model structure and References/WorldModelOutputFormat.md for the result. Read the supplied evidence and constraints. For research, use host search tools and verify citations. Separate observations, assumptions and scenario probabilities; no future is presented as a known outcome. Mark models older than 30 days as stale and older than 90 days as substantially stale. Report missing models and unavailable evidence explicitly.

Return a table of present, missing and stale models, with dates and recommended refreshes. Make no writes.
