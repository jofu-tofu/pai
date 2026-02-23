### M4.1 NEW Variables Before Use

**Impact: CRITICAL (Leaked symbol-table state causes cross-call corruption)**

Routine-local mutable variables should be `NEW`ed before use in reusable code paths.

**Avoid:**
```m
set tmp=tmp+1
```

**Prefer:**
```m
new tmp
set tmp=tmp+1
```

