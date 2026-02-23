### M6.2 Set Standard Error Trap

**Impact: CRITICAL (Without a standard trap, failures become untraceable)**

Initialize the standard trap pattern (for example via shared wrapper conventions) before mutation-heavy logic.

Trap setup should be consistent across routines so failures route through common logging and recovery behavior.

