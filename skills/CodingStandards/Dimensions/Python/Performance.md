# Performance -- Python

> Prevent algorithmic complexity traps and startup penalties that silently degrade performance under scale.

## Mental Model

Python performance problems rarely come from the language being slow. They come from hidden algorithmic complexity -- code that appears O(1) but is actually O(n), turning an O(n) loop into O(n^2) without any visible warning. The performance dimension focuses on three specific patterns where Python's flexibility creates these invisible traps.

The first and most dangerous pattern is **magic method complexity**. Python's dunder methods (`__len__`, `__bool__`, `__contains__`, `__eq__`, `__hash__`) are called implicitly by the language runtime in contexts the developer may not expect. `if collection:` calls `__bool__`. `item in collection` calls `__contains__`. `len(collection)` calls `__len__`. When these methods are O(n) instead of O(1), every implicit call introduces a hidden linear scan. A loop that checks `if item in collection` on each iteration becomes O(n^2) because the `in` operator triggers an O(n) `__contains__` on every iteration. The fix is structural: maintain auxiliary data structures (sets for membership, counters for length) so that magic methods can return in constant time.

The second pattern is **import-time computation**. Python executes module-level code at import time, which means that any computation, file I/O, network call, or heavy library initialization placed at module scope runs when the module is first imported -- not when the functionality is actually needed. In a large application with hundreds of modules, this can add seconds to startup time. In serverless environments where cold starts matter, it can add hundreds of milliseconds per invocation. In test suites, it means importing a module to test one function also triggers unrelated expensive initialization. The fix is deferral: use `@cache` decorated functions, lazy module `__getattr__`, or explicit initialization functions so that expensive work happens at first use, not at import.

The third pattern is **mutable default arguments**. This is not strictly a performance issue in the traditional sense, but it is a correctness issue that manifests as a performance-adjacent bug: unexpected data accumulation. When a function uses a mutable default (`def f(items=[])`), the default object is created once at function definition time and shared across all calls. Each call that mutates the default accumulates state from previous calls, causing memory to grow unboundedly and data to leak between logically independent invocations. The fix is the `None` sentinel pattern: use `None` as the default and create a fresh mutable object inside the function body on each call.

These three patterns share a common theme: **invisible costs**. The code looks simple and correct on the surface, but the actual runtime behavior is dramatically different from what a reader would expect. The performance dimension exists to make these costs visible and eliminate them structurally.

## Consumer Guide

### When Reviewing Code

Inspect every `__len__`, `__bool__`, `__contains__`, `__eq__`, and `__hash__` implementation to verify it operates in O(1) time. If any of these methods iterate over a collection, scan for loops in the codebase, or perform computation proportional to the object's size, flag it as a performance trap. Check module-level code for any operations beyond simple imports and constant definitions: function calls, file reads, database connections, and class instantiations at module scope are all candidates for deferral. Scan function signatures for mutable defaults (`=[]`, `={}`, `=set()`) and flag every occurrence.

### When Designing / Planning

When designing collection classes, plan the auxiliary data structures needed to keep magic methods O(1) from the beginning. If you need `__contains__`, maintain a set alongside your primary storage. If you need `__len__` on a filtered subset, maintain a counter. When designing modules, separate initialization from definition: define functions and classes at module level, but defer any computation to explicit initialization functions or lazy accessors. When designing function signatures, default to `None` for any parameter whose natural default is a mutable type, and document this pattern in team conventions.

### When Implementing

For magic methods: implement them as direct lookups into pre-computed state. `__len__` should return `self._count`, not `sum(1 for ...)`. `__contains__` should check `self._ids_set`, not iterate `self._items`. Update auxiliary structures in your mutation methods (`add`, `remove`, `update`) so the bookkeeping cost is amortized across mutations rather than concentrated in reads.

For import-time computation: use `functools.cache` (or `lru_cache`) to defer and memoize expensive initialization. For heavy optional dependencies, use the `TYPE_CHECKING` guard for imports and lazy accessor functions for runtime access. For module-level constants that require computation, use module `__getattr__` (Python 3.7+) to compute on first access.

For mutable defaults: always use `None` as the default and create the mutable object inside the function body. The pattern is: `def f(items: list[str] | None = None) -> ...: if items is None: items = []`. Apply this uniformly to `list`, `dict`, `set`, and any custom mutable class.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [PerfMagicMethodsO1](../../Rules/Python/PerfMagicMethodsO1.md) | HIGH | Magic methods must be O(1) to prevent implicit quadratic behavior in loops |
| [PerfDeferImportTime](../../Rules/Python/PerfDeferImportTime.md) | HIGH | Defer expensive computation from import time to first access |
| [OrgNoMutableDefaults](../../Rules/Python/OrgNoMutableDefaults.md) | HIGH | Never use mutable objects as default argument values |

## Rule Interactions

**PerfMagicMethodsO1 + TypeSystem dimension**: Type annotations on collection classes make magic method contracts explicit. When `__contains__` is typed as `def __contains__(self, item: Item) -> bool`, the return type is clear, but the complexity is not. Code review must verify the O(1) guarantee separately from the type signature.

**OrgNoMutableDefaults + TypeSystem dimension (TypeOptionalNullable)**: The `None` sentinel pattern for mutable defaults directly uses nullable typing: `items: list[str] | None = None`. The type annotation makes the sentinel pattern visible and the type checker verifies that the `None` case is handled inside the function body.

**PerfDeferImportTime + DefensiveProgramming dimension (DefensivePathChecking)**: When deferring file-based initialization, the path check moves from import time to first access. The deferred function must still verify the path exists before reading, combining the performance and defensive patterns.

**PerfMagicMethodsO1 + OrgNoMutableDefaults**: Collection classes that maintain auxiliary data structures for O(1) magic methods must be careful about mutable defaults in their own methods. `def add(self, item: Item, metadata: dict = {})` on a collection class combines two anti-patterns.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **O(n) `__contains__` on a collection used in loops**: Transforms an O(n) loop into O(n^2). This is the highest-impact performance anti-pattern because the quadratic behavior is completely invisible at the call site (`if item in collection` looks like a simple check).
- **Database connection or network call at module scope**: Blocks import of the entire module on network latency. In test environments, this means tests cannot even import the module without a live database.

### HIGH

- **O(n) `__len__` or `__bool__`**: Called implicitly in many contexts (`if collection`, `len(collection)`, boolean coercion). Less severe than `__contains__` in loops but still a hidden linear scan on every truthiness check.
- **Mutable default argument on a public API function**: Data leaks between callers. Severity is HIGH rather than CRITICAL because the bug is typically caught quickly in testing when return values contain unexpected data.
- **Heavy library import at module scope when only needed conditionally**: Importing `pandas`, `numpy`, or `torch` at module scope when only one function uses them adds seconds to startup time for all consumers of the module.

### MEDIUM

- **Module-level constant computed from file read**: `CONFIG = json.loads(Path("config.json").read_text())` at module scope. Fails loudly if the file is missing, but delays startup even when the config is not needed.
- **O(n) `__eq__` on a class used as dictionary key**: Degrades dict/set operations from O(1) average to O(n) when hash collisions occur. Less common in practice but devastating when it happens.

## Examples

**Magic method complexity trap:**

```python
# BAD: O(n) __contains__ creates quadratic loop
class UserPool:
    def __init__(self):
        self._users: list[User] = []

    def __contains__(self, user: User) -> bool:
        return any(u.id == user.id for u in self._users)  # O(n)

# This loop is O(n^2):
for user in all_users:
    if user in pool:  # O(n) each time
        process(user)

# GOOD: O(1) __contains__ with auxiliary set
class UserPool:
    def __init__(self):
        self._users: list[User] = []
        self._user_ids: set[int] = set()

    def add(self, user: User) -> None:
        self._users.append(user)
        self._user_ids.add(user.id)

    def __contains__(self, user: User) -> bool:
        return user.id in self._user_ids  # O(1)
```

**Import-time deferral:**

```python
# BAD: expensive work blocks every import
import pandas as pd
LARGE_REFERENCE = pd.read_csv("reference_data.csv")  # runs at import

# GOOD: deferred to first access
from functools import cache
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    import pandas as pd

@cache
def get_reference_data() -> "pd.DataFrame":
    import pandas as pd
    return pd.read_csv("reference_data.csv")
```

**Mutable default accumulation:**

```python
# BAD: shared list accumulates across calls
def collect_errors(msg: str, errors: list[str] = []) -> list[str]:
    errors.append(msg)
    return errors

collect_errors("first")   # ["first"]
collect_errors("second")  # ["first", "second"] -- leaked!

# GOOD: fresh list per call
def collect_errors(msg: str, errors: list[str] | None = None) -> list[str]:
    if errors is None:
        errors = []
    errors.append(msg)
    return errors
```

## Does Not Cover

- **Algorithmic optimization** of business logic (choosing the right data structure for a specific problem) -- this dimension covers Python-specific performance traps, not general algorithm design.
- **Concurrency and parallelism** (asyncio, threading, multiprocessing, the GIL) -- a separate domain with its own patterns and pitfalls.
- **Memory profiling and optimization** -- complementary to this dimension but requires runtime analysis tools rather than code review.
- **C extension performance** (Cython, ctypes, pybind11) -- optimization beyond pure Python is outside scope.
- **Database query optimization** -- performance at the data layer, not the Python code layer.

## Sources

- minimaxir's Python CLAUDE.md (O(1) magic methods requirement, mutable defaults)
- Dagster's "Dignified Python" (import-time computation deferral)
- Python documentation on `__contains__`, `__len__`, `__bool__` protocol methods
- Python documentation on mutable default arguments gotcha
