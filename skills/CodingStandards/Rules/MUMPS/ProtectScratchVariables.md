### M4.3 Protect Scratch Variables

**Impact: HIGH (Shared scratch namespace can be overwritten by called code)**

Do not assume `%` scratch variables remain stable across nested calls unless contractually guaranteed.

Prefer routine-local variables with explicit `NEW` and clear ownership.

