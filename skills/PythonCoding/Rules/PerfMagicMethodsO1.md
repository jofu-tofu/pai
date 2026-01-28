### 3.1 Magic Methods Must Be O(1)

**Impact: HIGH (Called implicitly/frequently, O(n) becomes O(n²))**

Magic methods like `__len__`, `__bool__`, `__hash__`, and `__eq__` are called implicitly and frequently. An O(n) implementation turns simple operations into O(n²) performance traps.

**Incorrect: O(n) magic methods**

```python
class ItemCollection:
    def __init__(self):
        self._items = []

    def __len__(self) -> int:
        # O(n) - called every time len() is used
        return sum(1 for _ in self._items if _.is_active)

    def __contains__(self, item: Item) -> bool:
        # O(n) - called for every 'in' check
        return any(i.id == item.id for i in self._items)

# This loop is O(n²)
for item in collection:
    if item in collection:  # O(n) contains check
        ...
```

**Correct: O(1) magic methods with cached state**

```python
class ItemCollection:
    def __init__(self):
        self._items: list[Item] = []
        self._active_count: int = 0
        self._item_ids: set[int] = set()

    def add(self, item: Item) -> None:
        self._items.append(item)
        self._item_ids.add(item.id)
        if item.is_active:
            self._active_count += 1

    def __len__(self) -> int:
        # O(1) - return cached count
        return self._active_count

    def __contains__(self, item: Item) -> bool:
        # O(1) - set lookup
        return item.id in self._item_ids

# This loop is now O(n)
for item in collection:
    if item in collection:  # O(1) contains check
        ...
```

**Magic methods that must be O(1):**
- `__len__` - called by `len()`, boolean contexts
- `__bool__` - called in every `if` statement
- `__hash__` - called for dict/set operations
- `__eq__` - called for comparisons, dict lookups
- `__contains__` - called by `in` operator
