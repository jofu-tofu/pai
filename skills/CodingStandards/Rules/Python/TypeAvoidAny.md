### PY2.3 Avoid Any Type

**Impact: CRITICAL (Any defeats the purpose of type checking)**

`Any` is a type-checking escape hatch that disables all verification. Code using `Any` can't be validated, and `Any` spreads virally - one `Any` infects everything it touches.

**Incorrect: Any disables type safety**

```python
from typing import Any

def process(data: Any) -> Any:
    # Type checker can't verify anything about this function
    return data.foo.bar()  # Could crash, no warning

# Any spreads to callers
result = process(user)  # result is Any
result.nonexistent_method()  # No error - type checking disabled
```

**Correct: Use specific types or generics**

```python
from typing import TypeVar
from collections.abc import Mapping

# Option 1: Specific type
def process(data: UserData) -> ProcessedResult:
    return ProcessedResult(data.foo.bar())

# Option 2: Generic for flexible but type-safe code
T = TypeVar("T")
def identity(value: T) -> T:
    return value

# Option 3: Protocol for structural typing
from typing import Protocol

class HasFooBar(Protocol):
    @property
    def foo(self) -> "HasBar": ...

class HasBar(Protocol):
    def bar(self) -> str: ...

def process(data: HasFooBar) -> str:
    return data.foo.bar()  # Type-safe access
```

**When Any is acceptable:**

```python
# Truly dynamic code (rare)
def json_loads(s: str) -> Any:  # JSON can be any structure
    ...

# Gradual typing migration (temporary)
def legacy_function(x: Any) -> Any:  # TODO: Add proper types
    ...

# Third-party untyped libraries (use type: ignore comment instead)
result = untyped_library.call()  # type: ignore[no-untyped-call]
```
