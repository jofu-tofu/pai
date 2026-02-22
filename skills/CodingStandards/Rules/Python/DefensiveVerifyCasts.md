### PY1.4 Verify Casts at Runtime

**Impact: CRITICAL (cast() only affects type checker, not runtime)**

`typing.cast()` tells the type checker to trust you, but performs no runtime verification. If your assumption is wrong, you get silent type mismatches that corrupt data downstream.

**Incorrect: Trust cast() blindly**

```python
from typing import cast

# Type checker believes this is User, but runtime doesn't verify
user = cast(User, get_entity(user_id))
# If get_entity returns None or wrong type, user.name crashes later
print(user.name)

# Casting API response without validation
data = cast(dict[str, int], api_response.json())
# If response has wrong structure, bugs appear far from this line
```

**Correct: Validate then cast, or use isinstance**

```python
from typing import cast

# Option 1: isinstance guard (preferred)
entity = get_entity(user_id)
if not isinstance(entity, User):
    raise TypeError(f"Expected User, got {type(entity).__name__}")
user = entity  # Type narrowed automatically
print(user.name)

# Option 2: Validate structure before cast
response_data = api_response.json()
if not isinstance(response_data, dict):
    raise ValueError("Expected dict response")
if not all(isinstance(v, int) for v in response_data.values()):
    raise ValueError("Expected all int values")
data = cast(dict[str, int], response_data)

# Option 3: Use TypeGuard for reusable validation
from typing import TypeGuard

def is_user(obj: object) -> TypeGuard[User]:
    return isinstance(obj, User)

entity = get_entity(user_id)
if not is_user(entity):
    raise TypeError("Expected User")
# entity is now typed as User
```
