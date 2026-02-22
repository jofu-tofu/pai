# Defensive Programming -- Python

> Write code that anticipates failure at every boundary and makes its safety guarantees visible in the source text.

## Mental Model

Defensive programming in Python is rooted in a single observation: Python's dynamic runtime will happily let incorrect data flow through your program for thousands of lines before something finally crashes -- and the crash site will be far from the cause. The defensive dimension exists to collapse that distance to zero.

The core principle is **verification at the point of entry**. Every time data crosses a trust boundary -- user input, file system access, type casts, dictionary lookups, API responses -- the code must explicitly verify the data before proceeding. This is not paranoia; it is a structural guarantee that when something goes wrong, the error message points at the exact line where the assumption was violated.

Python's culture historically favored EAFP ("Easier to Ask Forgiveness than Permission"), wrapping operations in try/except blocks and handling failures after the fact. This dimension pushes back toward LBYL ("Look Before You Leap") for the majority of cases. The reason is readability: when a reader encounters an `if` guard, they immediately understand the precondition. When they encounter a try/except, they must mentally simulate the failure path and trace which exception corresponds to which operation. LBYL makes the contract visible; EAFP hides it inside exception handlers.

The exception-handling side of defensive programming is equally important. Swallowed exceptions -- `except: pass` or `except Exception: log()` without re-raising -- are among the most dangerous patterns in Python. They convert loud failures into silent data corruption. A function that catches an exception and returns normally has lied to its caller about success. The caller's code continues executing under false assumptions, and the resulting bugs are extremely difficult to trace because the original error context has been discarded.

Path checking is the third pillar. File operations in Python raise `FileNotFoundError` or `OSError` with stack traces that can be cryptic, especially when paths are constructed dynamically. Checking existence, type (file vs. directory), and permissions before operating provides clear, actionable error messages and prevents cascading failures in pipelines where one missing file can corrupt an entire batch.

Finally, `typing.cast()` is a compile-time-only annotation that performs zero runtime verification. Code that uses `cast()` without a preceding `isinstance` check is making an unchecked assumption that will silently propagate incorrect types through the rest of the program. The defensive approach demands that every cast be preceded by a runtime assertion or guard.

## Consumer Guide

### When Reviewing Code

Look for these signals that defensive checks are missing: bare dictionary access with `[]` instead of `.get()`, file opens without path existence checks, `except Exception: pass` or `except: pass` blocks, `typing.cast()` calls without a preceding `isinstance` check, and functions that catch exceptions but do not re-raise or transform them. Each of these is a location where a silent failure can enter the system. Flag any try/except block where the except clause does not either re-raise, transform the exception to a domain-specific type, or take a meaningful corrective action (setting error state, notifying, rolling back).

### When Designing / Planning

Structure your system so that trust boundaries are explicit. Identify where external data enters: CLI arguments, configuration files, API responses, database queries, file system operations. Each entry point should have a validation layer that runs before the data reaches business logic. Plan for path validation as a first-class concern in any file-processing pipeline. When designing interfaces that accept generic types or use `Any`, plan the runtime verification strategy alongside the type annotations.

### When Implementing

Apply LBYL as the default pattern. Use `dict.get()` instead of `dict[key]` when the key might be absent. Use `Path.exists()` and `Path.is_file()` before opening files. Use `isinstance()` checks before or instead of `typing.cast()`. When you must use try/except (race conditions, third-party APIs that only signal via exceptions, performance-critical paths where exceptions are rare), catch the most specific exception type possible and either re-raise, transform to a domain exception with `from e`, or take a concrete corrective action. Never write `except: pass` or `except Exception: pass`.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [DefensiveLbyl](../../Rules/Python/DefensiveLbyl.md) | CRITICAL | Prefer Look Before You Leap over exception-based flow to make intent explicit |
| [DefensiveNeverSwallow](../../Rules/Python/DefensiveNeverSwallow.md) | CRITICAL | Never catch exceptions without handling, transforming, or re-raising them |
| [DefensivePathChecking](../../Rules/Python/DefensivePathChecking.md) | CRITICAL | Verify file and directory existence before performing file system operations |
| [DefensiveVerifyCasts](../../Rules/Python/DefensiveVerifyCasts.md) | CRITICAL | Validate types at runtime before or instead of using typing.cast() |

## Rule Interactions

**DefensiveLbyl + DefensiveNeverSwallow**: These two rules form a complementary pair. LBYL reduces the number of exceptions that occur in the first place; NeverSwallow ensures that the exceptions which do occur are handled properly. Together, they eliminate both categories of silent failure: the ones prevented by pre-checks and the ones that slip through to exception handlers.

**DefensiveVerifyCasts + TypeSystem dimension**: Cast verification is the runtime counterpart to the type system rules. TypeHintsRequired ensures types are declared; DefensiveVerifyCasts ensures they are enforced at runtime boundaries where the type checker cannot reach (deserialization, dynamic lookups, external data).

**DefensivePathChecking + DefensiveLbyl**: Path checking is a specialized form of LBYL applied to the file system. The general LBYL principle ("check before operating") becomes concrete as "check path existence, type, and permissions before reading or writing."

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Bare `except: pass`**: Silences every possible error including `KeyboardInterrupt` and `SystemExit`. The program becomes unkillable and all errors vanish. This must never appear in production code.
- **`except Exception: pass`**: Slightly better than bare except (allows `SystemExit` through) but still silences all operational errors. Data corruption will go undetected.
- **`typing.cast()` on deserialized data without validation**: API responses, JSON loads, and database query results are never guaranteed to match your type annotations. Casting without checking creates a false sense of safety that is worse than having no types at all.

### HIGH

- **EAFP for control flow on expected conditions**: Using try/except to handle cases that are expected (key might not exist, value might be None) hides the logic inside exception handlers. Readers must mentally simulate failures to understand the normal path.
- **Catching exceptions and returning a default silently**: `try: return process(x) except ValueError: return None` -- the caller has no way to distinguish "successfully returned None" from "failed and returned None."

### MEDIUM

- **Path operations without parent directory creation**: Writing to a file without ensuring the parent directory exists via `mkdir(parents=True, exist_ok=True)`. The error only manifests when the path does not exist, making it an intermittent failure.
- **Using `dict[key]` when the key is user-controlled**: If the key comes from external input, `KeyError` is an expected condition, not an exceptional one. Use `.get()` with a default or an explicit `in` check.

## Examples

**Collapsing the distance between cause and crash site:**

```python
# BAD: crash site is far from the cause
def process_config(path: str) -> Config:
    with open(path) as f:                    # crashes here with FileNotFoundError
        raw = json.load(f)
    token = cast(str, raw.get("api_token"))  # silently None if missing
    return Config(token=token.strip())       # crashes HERE with AttributeError
    # The real cause (missing key) is two lines above the crash

# GOOD: every boundary is checked at entry
def process_config(path: str) -> Config:
    config_path = Path(path)
    if not config_path.is_file():
        raise ConfigError(f"Config file not found: {config_path}")

    with open(config_path) as f:
        raw = json.load(f)

    token = raw.get("api_token")
    if not isinstance(token, str):
        raise ConfigError(f"Expected string for api_token, got {type(token).__name__}")

    return Config(token=token.strip())
```

**Exception handling done right vs. wrong:**

```python
# BAD: swallowed exception hides database failure
def save_order(order: Order) -> bool:
    try:
        db.session.add(order)
        db.session.commit()
        return True
    except Exception:
        return False  # caller thinks "order not saved" but has no idea WHY

# GOOD: meaningful handling with preserved context
def save_order(order: Order) -> None:
    try:
        db.session.add(order)
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback()
        raise DuplicateOrderError(f"Order {order.id} already exists") from e
    except OperationalError as e:
        db.session.rollback()
        raise DatabaseUnavailableError("Database connection failed") from e
```

## Does Not Cover

- **Input sanitization for security** (SQL injection, XSS) -- this dimension covers structural validation, not security-specific escaping or parameterization.
- **Retry and circuit-breaker patterns** -- these are resilience patterns that sit above defensive programming.
- **Logging strategy** -- DefensiveNeverSwallow requires that swallowed exceptions be handled, but the specific logging framework and configuration is outside this scope.
- **Property-based testing or fuzzing** -- complementary verification strategies that test the boundaries this dimension guards.

## Sources

- minimaxir's Python CLAUDE.md (LBYL preference, cast verification patterns)
- Dagster's "Dignified Python" (exception handling philosophy, path safety)
- Python documentation on LBYL vs. EAFP idioms
- mypy documentation on `typing.cast()` limitations
