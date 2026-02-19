### 2.2 Use Literal Types

**Impact: CRITICAL (Catches typos at type-check time)**

`Literal` types restrict values to specific constants, catching typos and invalid values before runtime. The type checker enforces valid values at every call site.

**Incorrect: String accepts any value**

```python
def set_log_level(level: str) -> None:
    # Typo "DEUBG" won't be caught until runtime
    valid = {"DEBUG", "INFO", "WARNING", "ERROR"}
    if level not in valid:
        raise ValueError(f"Invalid level: {level}")
    ...

# Caller can pass anything
set_log_level("DEUBG")  # Typo passes type check, fails at runtime
```

**Correct: Literal restricts to valid values**

```python
from typing import Literal

LogLevel = Literal["DEBUG", "INFO", "WARNING", "ERROR"]

def set_log_level(level: LogLevel) -> None:
    # No runtime validation needed - type system guarantees valid input
    ...

# Type checker catches the typo immediately
set_log_level("DEUBG")  # Error: Argument of type "DEUBG" cannot be assigned
set_log_level("DEBUG")  # OK
```

**Common Literal patterns:**

```python
from typing import Literal

# HTTP methods
HttpMethod = Literal["GET", "POST", "PUT", "DELETE", "PATCH"]

# Status values
Status = Literal["pending", "processing", "complete", "failed"]

# Direction/mode values
SortOrder = Literal["asc", "desc"]
Mode = Literal["read", "write", "append"]

# Boolean-like with semantic meaning
OnOff = Literal["on", "off"]  # Clearer than bool for some APIs

# Combining with overloads for return type narrowing
from typing import overload

@overload
def fetch(url: str, format: Literal["json"]) -> dict: ...
@overload
def fetch(url: str, format: Literal["text"]) -> str: ...
def fetch(url: str, format: Literal["json", "text"]) -> dict | str:
    ...
```
