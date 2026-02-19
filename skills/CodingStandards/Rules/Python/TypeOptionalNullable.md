### 2.4 Optional for Nullable

**Impact: CRITICAL (Explicit null handling prevents surprises)**

Use `X | None` (or `Optional[X]`) to explicitly mark values that can be null. This forces callers to handle the null case and lets the type checker catch missing null checks.

**Incorrect: Implicit nullability**

```python
# Return type doesn't indicate possible None
def find_user(user_id: int) -> User:
    result = db.query(User).filter_by(id=user_id).first()
    return result  # Could be None!

# Caller assumes non-null
user = find_user(123)
print(user.name)  # AttributeError if user is None
```

**Correct: Explicit nullable return**

```python
def find_user(user_id: int) -> User | None:
    return db.query(User).filter_by(id=user_id).first()

# Type checker forces null handling
user = find_user(123)
print(user.name)  # Error: user might be None

# Caller must handle null
user = find_user(123)
if user is not None:
    print(user.name)  # OK - type narrowed to User

# Or use guard clause
user = find_user(123)
if user is None:
    raise NotFoundError(f"User {user_id} not found")
print(user.name)  # OK - type narrowed to User
```

**Nullable patterns:**

```python
# Function parameters with None default
def greet(name: str | None = None) -> str:
    return f"Hello, {name or 'stranger'}!"

# Distinguishing "not provided" from "explicitly None"
from typing import Literal

_UNSET: Literal["_UNSET"] = "_UNSET"

def update(value: str | None | Literal["_UNSET"] = _UNSET) -> None:
    if value is _UNSET:
        return  # Not provided, don't update
    # value is str | None here - explicitly provided

# Optional in containers
def get_values() -> dict[str, int | None]:
    return {"a": 1, "b": None, "c": 3}
```
