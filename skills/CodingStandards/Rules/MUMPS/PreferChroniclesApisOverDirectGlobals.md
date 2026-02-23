### M5.1 Prefer Chronicles APIs Over Direct Globals

**Impact: CRITICAL (Direct global coupling is brittle to data-layout change)**

Use released Chronicles APIs and wrappers for data reads/writes whenever available.

**Avoid:**
```m
set val=$get(^ERX(ini,id,item))
```

**Prefer:**
```m
set val=$$zGetItem^%Zelibh(ini,id,item)
```

