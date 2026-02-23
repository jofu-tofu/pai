### M5.3 Avoid Naked Global References

**Impact: CRITICAL (Naked references are fragile and context-dependent)**

Do not rely on implicit naked global state. Keep each global reference explicit to prevent accidental reads/writes to unintended nodes.

