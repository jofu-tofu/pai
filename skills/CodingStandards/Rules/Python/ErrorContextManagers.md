### PY4.5 Use Context Managers

**Impact: MEDIUM (Guarantees resource cleanup)**

Context managers ensure resources are properly released even when exceptions occur. Without them, files stay open, locks remain held, and connections leak under error conditions.

**Incorrect: Manual resource management**

```python
# File may stay open if exception occurs
f = open("data.txt")
data = f.read()
process(data)
f.close()  # Never reached if process() raises

# Lock may stay held
lock.acquire()
do_critical_work()
lock.release()  # Never reached if work raises

# Connection may leak
conn = database.connect()
result = conn.execute(query)
conn.close()  # Never reached if execute raises
```

**Correct: Context managers guarantee cleanup**

```python
# File always closed, even on exception
with open("data.txt") as f:
    data = f.read()
    process(data)

# Lock always released
with lock:
    do_critical_work()

# Connection always returned to pool
with database.connect() as conn:
    result = conn.execute(query)
```

**Custom context managers:**

```python
from contextlib import contextmanager

@contextmanager
def timed_operation(name: str):
    """Log duration of an operation."""
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        logger.info(f"{name} took {elapsed:.2f}s")

with timed_operation("data_processing"):
    process_large_dataset()

# Class-based for complex state
class DatabaseTransaction:
    def __init__(self, connection):
        self.conn = connection

    def __enter__(self):
        self.conn.begin()
        return self.conn

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            self.conn.commit()
        else:
            self.conn.rollback()
        return False  # Don't suppress exceptions
```
