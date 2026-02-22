### PY1.1 LBYL over EAFP

**Impact: CRITICAL (Makes intent explicit, reader sees conditions immediately)**

"Look Before You Leap" makes code intent visible at the point of execution. When you check conditions first, readers understand the logic without tracing exception handlers.

**Incorrect: Exception-based flow hides intent**

```python
# Reader must trace exception to understand the fallback
try:
    value = config[key]
except KeyError:
    value = default

# Exception handling for expected conditions
try:
    result = int(user_input)
except ValueError:
    result = 0
```

**Correct: Explicit checks show intent**

```python
# Intent is immediately clear
value = config.get(key, default)

# Explicit validation before conversion
if user_input.isdigit():
    result = int(user_input)
else:
    result = 0
```

**When EAFP is acceptable:**
- Race conditions where checking and acting aren't atomic (file existence)
- Performance-critical paths where exceptions are rare
- Third-party APIs that only signal errors via exceptions
