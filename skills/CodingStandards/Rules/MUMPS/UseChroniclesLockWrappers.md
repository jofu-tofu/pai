### M6.1 Use Chronicles Lock Wrappers

**Impact: CRITICAL (Ad hoc locking creates contention and inconsistency)**

Use approved lock/unlock wrappers (for example `$$zlock`/`$$zunlock`) instead of custom lock-string handling in application routines.

Acquire locks before mutation and release them on every exit path.

