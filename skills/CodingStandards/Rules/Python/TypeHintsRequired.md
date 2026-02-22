### PY2.1 Type Hints Required

**Impact: CRITICAL (Types are documentation that runs)**

Type hints catch bugs before runtime, serve as always-accurate documentation, and enable IDE features like autocomplete and refactoring. Untyped code accumulates maintenance debt.

**Incorrect: No type information**

```python
# What types does this accept? What does it return?
def process(data, threshold):
    return [x for x in data if x > threshold]

# Readers must trace through code to understand types
def fetch_user(user_id):
    response = api.get(f"/users/{user_id}")
    return response.json() if response.ok else None
```

**Correct: Explicit types everywhere**

```python
def process(data: list[float], threshold: float) -> list[float]:
    return [x for x in data if x > threshold]

def fetch_user(user_id: int) -> User | None:
    response = api.get(f"/users/{user_id}")
    return User(**response.json()) if response.ok else None
```

**Type hint patterns:**

```python
from typing import Callable, TypeVar
from collections.abc import Iterator, Mapping

# Generic functions
T = TypeVar("T")
def first(items: list[T]) -> T | None:
    return items[0] if items else None

# Callable types
Handler = Callable[[Request], Response]
def register(path: str, handler: Handler) -> None: ...

# Collection protocols (prefer over concrete types)
def summarize(data: Mapping[str, int]) -> int:
    return sum(data.values())

# Class attributes
class Config:
    timeout: int
    retries: int = 3
    base_url: str | None = None
```
