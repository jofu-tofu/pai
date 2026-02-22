### PY3.2 Defer Import-Time Computation

**Impact: HIGH (Prevents startup delays, circular imports)**

Code that runs at import time delays application startup and can cause circular import errors. Defer expensive operations to first use or explicit initialization.

**Incorrect: Work at import time**

```python
# config.py
import json
from pathlib import Path

# Runs when module is imported
CONFIG = json.loads(Path("config.json").read_text())
DB_CONNECTION = create_database_connection(CONFIG["database"])

# This constant requires expensive computation
PROCESSED_DATA = expensive_computation()
```

**Correct: Defer to first access**

```python
# config.py
import json
from functools import cache
from pathlib import Path

@cache
def get_config() -> dict:
    """Load config on first access, cache for subsequent calls."""
    return json.loads(Path("config.json").read_text())

@cache
def get_db_connection() -> Connection:
    """Create connection on first access."""
    return create_database_connection(get_config()["database"])

@cache
def get_processed_data() -> ProcessedData:
    """Compute on first access."""
    return expensive_computation()
```

**Alternative: Lazy module pattern**

```python
# heavy_module.py
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    import pandas as pd  # Only for type hints

_pandas = None

def get_pandas():
    """Import pandas only when needed."""
    global _pandas
    if _pandas is None:
        import pandas as pd
        _pandas = pd
    return _pandas

def process_dataframe(data: list[dict]) -> "pd.DataFrame":
    pd = get_pandas()
    return pd.DataFrame(data)
```

**Module-level `__getattr__` for lazy attributes (Python 3.7+):**

```python
# module.py
def __getattr__(name: str):
    if name == "EXPENSIVE_CONSTANT":
        value = compute_expensive_value()
        globals()["EXPENSIVE_CONSTANT"] = value
        return value
    raise AttributeError(f"module has no attribute {name}")
```
