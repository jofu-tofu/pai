# Strategic Review Dimensions

Structured review lenses that challenge the frame itself — not code quality within the current architecture, but whether the architecture is moving in the right direction. These dimensions operate adversarially by default, shifting the reviewer's prior from "validate" to "challenge."

## Dimensions

| ID | Dimension | File | Triggers When |
|----|-----------|------|---------------|
| D1 | Placement Validity | PlacementValidity.md | Diff: new files created OR `affected_directories` spans 2+ modules. Audit: ALWAYS |
| D2 | Architectural Trajectory | ArchitecturalTrajectory.md | Diff: new files created OR new patterns introduced OR `diff_line_count` > 150. Audit: `target_directory_count` >= 3 |
| D3 | Assumption Audit | AssumptionAudit.md | ALWAYS (baseline — activates for every review in both modes) |

## Default Activation

- **Always active:** D3 (baseline strategic lens for every review)
- **Multi-module or new-file changes:** D1 additionally activates
- **Large changes (300+ lines or 50+ files):** All dimensions activate
