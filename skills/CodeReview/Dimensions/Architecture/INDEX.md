# Architecture Review Dimensions

Structured review lenses for architectural quality. Each dimension is a single-agent review document — the agent reads the file and works through every heuristic.

## Dimensions

| ID | Dimension | File | Triggers When |
|----|-----------|------|---------------|
| A1 | Modularity & Boundaries | Modularity.md | `affected_directories` spans 3+ modules OR `diff_line_count` > 100 |
| A2 | Modifiability & Extensibility | Modifiability.md | New interfaces/abstract classes in diff OR `commit_messages` contains "refactor" |
| A3 | Consistency & Conventions | Consistency.md | `affected_directories` spans 2+ modules (cross-module consistency check) |
| A4 | Dependency Health | DependencyHealth.md | Import statements changed OR `affected_directories` spans 3+ modules |
| A5 | Design Intent Clarity | DesignIntent.md | ALWAYS (baseline — activates for every review) |

## Default Activation

- **Always active:** A5 (baseline architecture lens for every review)
- **Multi-file changes:** A1, A3, A4 additionally activate
- **Large changes (300+ lines):** All dimensions activate

## Context Notes

Architecture agents (especially A1, A4) need broader context than just the diff. DelegateAgents provides them with GatherContext's `file_list` (all files in affected modules) and `module_map` (directory tree structure) in addition to the filtered diff.
