### M4.4 Validate Required Parameters

**Impact: HIGH (Unchecked inputs produce undefined behavior in deep call stacks)**

Validate required parameters at tag entry and return explicit error values on precondition failure.

Fail fast before any data mutation or lock acquisition.

