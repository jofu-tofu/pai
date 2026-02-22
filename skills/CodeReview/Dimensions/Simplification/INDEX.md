# Simplification Review Dimensions

Structured review lenses for code simplification opportunities. Each dimension is a single-agent review document — the agent reads the file and works through every heuristic.

## Dimensions

| ID | Dimension | File | Triggers When |
|----|-----------|------|---------------|
| S1 | Bloat Detection | BloatDetection.md | Diff: `diff_line_count` > 50 OR new files created. Audit: `target_file_count` > 10 OR total target lines > 1000 |
| S2 | Coupling Analysis | CouplingAnalysis.md | Diff: `affected_directories` spans 2+ modules OR import statements changed. Audit: `target_directory_count` >= 2 (cross-module coupling check) |
| S3 | Dispensability Scan | DispensabilityScan.md | Diff: `diff_line_count` > 100 OR `commit_messages` contains "refactor"/"cleanup". Audit: `target_file_count` > 15 (dead code and unused export scan) |
| S4 | Complexity Reduction | ComplexityReduction.md | ALWAYS (baseline — activates for every review in both modes) |
| S5 | Change Resistance | ChangeResistance.md | Diff: `affected_directories` spans 3+ modules OR `diff_line_count` > 200. Audit: `target_directory_count` >= 3 OR `target_file_count` > 30 |

## Default Activation

- **Always active:** S4 (baseline simplification lens for every review)
- **Medium+ changes (50+ lines):** S1, S2 additionally activate
- **Large changes (300+ lines):** All dimensions activate
- **Refactoring intent:** All dimensions activate when commit messages signal refactoring
