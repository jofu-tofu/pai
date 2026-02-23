### M1.4 Avoid Non-Portable Device Commands

**Impact: HIGH (Device handling differences can break runtime behavior)**

Do not rely on implementation-specific `OPEN`, `USE`, `CLOSE`, or device semantics in shared code.

**Avoid:** direct device command variants that only work in one implementation.

**Prefer:** wrapper functions for file/socket/device operations and timeouts.

