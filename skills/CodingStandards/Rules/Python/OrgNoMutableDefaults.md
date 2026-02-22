### PY3.3 No Mutable Default Arguments

**Impact: HIGH (Shared mutable default causes data leaks)**

Mutable default arguments are evaluated once at function definition, not per call. All calls share the same object, causing data to leak between calls and persist unexpectedly.

**Incorrect: Mutable default**

```python
def append_item(item: str, items: list[str] = []) -> list[str]:
    items.append(item)
    return items

# Each call modifies the same list
result1 = append_item("a")  # ["a"]
result2 = append_item("b")  # ["a", "b"] - leaked from previous call!

def create_user(name: str, tags: dict[str, str] = {}) -> User:
    tags["created_by"] = "system"
    return User(name=name, tags=tags)

# All users share the same tags dict
user1 = create_user("Alice")
user2 = create_user("Bob")  # user2.tags contains user1's data!
```

**Correct: None default with creation inside**

```python
def append_item(item: str, items: list[str] | None = None) -> list[str]:
    if items is None:
        items = []
    items.append(item)
    return items

# Each call gets a fresh list
result1 = append_item("a")  # ["a"]
result2 = append_item("b")  # ["b"] - independent

def create_user(name: str, tags: dict[str, str] | None = None) -> User:
    if tags is None:
        tags = {}
    tags["created_by"] = "system"
    return User(name=name, tags=tags)
```

**Common mutable types to watch for:**
- `list` - use `None` default, create inside
- `dict` - use `None` default, create inside
- `set` - use `None` default, create inside
- Custom mutable classes - use `None` or factory functions

**Immutable defaults are safe:**

```python
# These are fine - immutable types
def process(count: int = 0) -> int: ...
def greet(name: str = "World") -> str: ...
def configure(options: tuple[str, ...] = ()) -> Config: ...
```
