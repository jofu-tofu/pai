### PY1.3 Check Path Existence

**Impact: CRITICAL (Prevents OSError on non-existent paths)**

File operations on non-existent paths raise `FileNotFoundError` or `OSError`. Checking paths before operations provides clear error messages and prevents cascading failures.

**Incorrect: Assume paths exist**

```python
# Crashes with cryptic OSError if path missing
with open(config_path) as f:
    config = json.load(f)

# Parent directory may not exist
output_path.write_text(content)
```

**Correct: Verify paths explicitly**

```python
from pathlib import Path

# Check file exists with clear error
config_path = Path(config_path)
if not config_path.exists():
    raise ConfigurationError(f"Config file not found: {config_path}")

with open(config_path) as f:
    config = json.load(f)

# Ensure parent directory exists before write
output_path = Path(output_path)
output_path.parent.mkdir(parents=True, exist_ok=True)
output_path.write_text(content)
```

**Additional defensive checks:**

```python
# Check it's actually a file, not a directory
if not config_path.is_file():
    raise ConfigurationError(f"Expected file, got directory: {config_path}")

# Check permissions before attempting write
if output_path.exists() and not os.access(output_path, os.W_OK):
    raise PermissionError(f"Cannot write to: {output_path}")
```
