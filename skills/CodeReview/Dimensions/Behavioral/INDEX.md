# Behavioral Correctness Dimensions

Structured review lenses that evaluate whether the code produces the right results for all valid inputs. These dimensions focus on correctness concerns that require human judgment and context understanding — not pattern-matching that linters and type checkers should handle. Null safety, resource leaks, type errors, and dead code are excluded because they belong in automated tooling.

## Dimensions

| ID | Dimension | File | Triggers When |
|----|-----------|------|---------------|
| B1 | Boundary & Edge Case Errors | BoundaryErrors.md | ALWAYS (baseline — activates for every review in both modes) |
| B2 | Logic & Boolean Errors | LogicErrors.md | ALWAYS (baseline — activates for every review in both modes) |
| B3 | Completeness of Case Handling | CaseCompleteness.md | Diff: `diff_line_count` > 20 OR switch/match/enum in diff. Audit: ALWAYS |
| B4 | Data Transformation Errors | DataTransformation.md | Diff: `diff_line_count` > 30 OR mapping/serialization/conversion in diff. Audit: `target_file_count` > 5 |

## Default Activation

- **Always active:** B1, B2 (baseline behavioral lenses for every review)
- **Branching-heavy or medium+ changes:** B3 additionally activates
- **Data-pipeline or large changes:** B4 additionally activates
- **Large changes (300+ lines or 50+ files):** All dimensions activate
