### M2.2 Keep Command Spacing Consistent

**Impact: HIGH (Inconsistent spacing increases parser and review errors)**

Use one spacing standard for commands and arguments in each routine.

**Prefer:**
```m
set x=1,y=2
if x>0 do Tag^ROU()
```

**Avoid:**
```m
set x = 1 , y = 2
if  x > 0  do  Tag^ROU ( )
```

