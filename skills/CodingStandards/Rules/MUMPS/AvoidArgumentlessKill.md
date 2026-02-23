### M4.2 Avoid Argumentless KILL

**Impact: CRITICAL (Can destroy expected runtime context)**

Never use argumentless `KILL` in shared logic. It can clear more state than intended and break upstream callers.

Always kill explicit variables only.

