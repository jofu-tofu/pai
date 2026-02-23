### M1.2 Isolate Implementation-Specific Code

**Impact: CRITICAL (Uncontained vendor behavior breaks upgrade and cross-platform safety)**

Implementation-dependent behavior belongs in designated wrapper layers, not in application routines.

**Avoid:**
```m
set x=$zv
if x["GT.M" zwrite ^TMP("A")
```

**Prefer:**
```m
set %=$$zPlatformAction^%ZdWrapper(args...)
```

Keep call sites implementation-independent.

