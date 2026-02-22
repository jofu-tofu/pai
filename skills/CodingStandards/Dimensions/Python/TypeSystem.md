# Type System -- Python

> Treat type annotations as executable documentation that prevents entire categories of bugs before any code runs.

## Mental Model

Python's type system is optional and gradual -- the interpreter ignores annotations at runtime, and you can add types to some functions while leaving others untyped. This flexibility is both its greatest strength and its greatest risk. The strength is that you can adopt types incrementally in a million-line codebase. The risk is that developers treat types as optional decoration rather than as a structural contract, leading to codebases where some paths are verified and others are not, with `Any` silently bridging the gaps.

The mental model for this dimension is: **types are the first line of defense**. Before defensive runtime checks (dimension PY1), before tests, before code review, the type checker can verify that functions receive and return the correct types, that nullable values are handled, that string constants match a known set, and that generic containers preserve their element types through transformations. Every function signature without type hints is a missed opportunity to catch bugs automatically.

The key insight is that `Any` is viral. When a function accepts or returns `Any`, every downstream consumer inherits that `Any`, and the type checker stops verifying their code too. A single `Any` at a system boundary can disable type checking across an entire call chain. This is why avoiding `Any` is rated CRITICAL -- it is not about one function, it is about the cascading loss of verification across the codebase.

`Literal` types take this a step further by restricting values, not just types. A parameter typed as `str` accepts any string; a parameter typed as `Literal["GET", "POST", "PUT", "DELETE"]` only accepts those four values. The type checker catches typos at development time rather than runtime, and the set of valid values is documented directly in the signature. This is especially valuable for configuration options, status strings, mode flags, and any parameter where only specific values are meaningful.

`Optional` (or the modern `X | None` syntax) forces callers to handle the null case. Without it, a function that sometimes returns `None` appears to always return a value, and callers skip the null check. With explicit nullability, the type checker flags every use site that does not handle `None`, turning a category of `AttributeError: 'NoneType' has no attribute` crashes into compile-time errors.

The practical goal is a codebase where `mypy --strict` (or `pyright` in strict mode) passes with zero errors. This means every function has complete annotations, `Any` is used only in genuinely dynamic code (JSON parsing boundaries, gradual migration stubs), `Literal` replaces bare `str` for known value sets, and `X | None` replaces implicit nullability. The type checker then becomes a continuous verification tool that catches regressions automatically on every commit.

## Consumer Guide

### When Reviewing Code

Check that every function and method has complete type annotations on all parameters and the return type. Look specifically for: functions with no annotations, functions that use `Any` where a specific type or generic would work, string parameters that accept only a known set of values (candidates for `Literal`), and functions that can return `None` but whose return type does not include `| None`. Verify that `TypeVar` is used for generic functions instead of `Any`. Check that class attributes are annotated, especially in `__init__` methods and dataclasses. Flag any `# type: ignore` comment that does not include a specific error code (e.g., `# type: ignore[arg-type]` is acceptable; bare `# type: ignore` is not).

### When Designing / Planning

When designing interfaces, start with the type signatures before writing implementation. The signature is the contract: it tells consumers what they must provide and what they will receive. Use `Protocol` for structural typing when you need duck-typing compatibility but still want type safety. Plan your generic types (`TypeVar`, `ParamSpec`) for utility functions that must work across multiple types. When designing APIs that accept configuration options or mode strings, define `Literal` type aliases up front so the valid values are centralized and enforced. When designing return types, explicitly decide whether `None` is a valid return and annotate accordingly -- do not let implicit `None` returns leak through.

### When Implementing

Annotate every function signature completely. Use modern syntax: `list[int]` instead of `List[int]`, `dict[str, Any]` instead of `Dict[str, Any]`, `X | None` instead of `Optional[X]` (Python 3.10+, or with `from __future__ import annotations`). Prefer `collections.abc` abstract types (`Mapping`, `Sequence`, `Iterator`) over concrete types (`dict`, `list`) in function parameters to accept the widest range of compatible inputs. Use `TypeVar` for functions that preserve input types. Create `Literal` type aliases for any parameter where the set of valid values is known and small. When dealing with third-party untyped libraries, create typed wrapper functions rather than letting `Any` propagate into your codebase.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [TypeHintsRequired](../../Rules/Python/TypeHintsRequired.md) | CRITICAL | Every function must have complete type annotations on parameters and return type |
| [TypeLiteralValues](../../Rules/Python/TypeLiteralValues.md) | CRITICAL | Use Literal types instead of bare str/int for parameters with known value sets |
| [TypeAvoidAny](../../Rules/Python/TypeAvoidAny.md) | CRITICAL | Avoid Any -- use specific types, generics, or Protocol for structural typing |
| [TypeOptionalNullable](../../Rules/Python/TypeOptionalNullable.md) | CRITICAL | Mark nullable values explicitly with X | None to force callers to handle None |

## Rule Interactions

**TypeHintsRequired + TypeAvoidAny**: These form a progression. TypeHintsRequired ensures annotations exist; TypeAvoidAny ensures they are meaningful. A function annotated as `def process(data: Any) -> Any` satisfies TypeHintsRequired but violates TypeAvoidAny -- the annotations exist but provide no verification.

**TypeLiteralValues + TypeAvoidAny**: Literal types are a stronger alternative to `str` the same way specific types are a stronger alternative to `Any`. Both rules push in the same direction: narrowing types to carry maximum information about valid values.

**TypeOptionalNullable + DefensiveProgramming dimension**: Explicit nullability in the type system creates the contract; defensive LBYL checks enforce it at runtime. When a function returns `User | None`, the type checker forces callers to handle `None`, and LBYL patterns (`if user is None: raise`) provide the runtime safety net.

**TypeHintsRequired + Performance dimension (OrgNoMutableDefaults)**: Type annotations on default parameters reveal mutable default bugs. `def f(items: list[str] = [])` is visually obvious when typed -- the annotation draws attention to the mutable default in a way that untyped code does not.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Untyped public API functions**: Public functions without type annotations cannot be verified by the type checker and force all consumers to guess at the contract. This is the most impactful typing failure because it disables verification across module boundaries.
- **`Any` as a convenience type**: Using `Any` because the correct type is complex (e.g., nested generics) rather than investing in a proper type alias or Protocol. The short-term convenience creates long-term verification blackholes.
- **Implicit None returns**: A function that has a code path returning `None` but whose return type does not include `| None`. The type checker may not catch the `None` and callers will crash with `AttributeError`.

### HIGH

- **Bare `# type: ignore` without error code**: Suppresses all type errors on the line, masking unrelated issues. Always specify the error code: `# type: ignore[assignment]`.
- **Using `dict` where `TypedDict` fits**: When a dictionary has a known, fixed schema (configuration objects, API response shapes), `TypedDict` provides key-level type checking that `dict[str, Any]` cannot.
- **String parameters that should be Literal**: A function parameter typed as `str` that only accepts a known set of values (log levels, HTTP methods, sort directions). Runtime validation catches mistakes late; `Literal` catches them at development time.

### MEDIUM

- **Using concrete collection types in parameters**: `def process(items: list[int])` rejects tuples and other sequences. Using `Sequence[int]` or `Iterable[int]` accepts a wider range of compatible inputs without losing type safety.
- **Missing TypeVar in utility functions**: A utility function that accepts one type and returns the same type, annotated as `def identity(x: object) -> object`, loses the input type. `TypeVar` preserves it: `def identity(x: T) -> T`.

## Examples

**Progressive type narrowing from Any to Literal:**

```python
# Level 0: No types (worst)
def set_log_level(level):
    ...

# Level 1: Basic types (better, still allows invalid values)
def set_log_level(level: str) -> None:
    ...

# Level 2: Literal types (best, catches typos at check time)
LogLevel = Literal["DEBUG", "INFO", "WARNING", "ERROR"]

def set_log_level(level: LogLevel) -> None:
    ...

set_log_level("DEUBG")  # Type error caught immediately
```

**Protocol for structural typing instead of Any:**

```python
# BAD: Any disables all checking
def serialize(obj: Any) -> str:
    return json.dumps(obj.to_dict())  # No guarantee .to_dict() exists

# GOOD: Protocol defines the structural contract
class Serializable(Protocol):
    def to_dict(self) -> dict[str, Any]: ...

def serialize(obj: Serializable) -> str:
    return json.dumps(obj.to_dict())  # Type checker verifies .to_dict() exists
```

**Explicit nullability forcing null handling:**

```python
# BAD: implicit None confuses callers
def find_user(user_id: int) -> User:
    result = db.query(User).filter_by(id=user_id).first()
    return result  # Could be None, but signature says User

# GOOD: explicit None forces handling
def find_user(user_id: int) -> User | None:
    return db.query(User).filter_by(id=user_id).first()

user = find_user(123)
if user is None:
    raise NotFoundError(f"User {user_id} not found")
# Type narrowed to User from here
```

## Does Not Cover

- **Runtime type enforcement** (pydantic, attrs, beartype) -- this dimension covers static type annotations checked by mypy/pyright, not runtime validation libraries.
- **typing.cast() safety** -- runtime cast verification is covered by the Defensive Programming dimension (DefensiveVerifyCasts).
- **Schema validation** for external data (JSON Schema, marshmallow, pydantic models) -- complements type annotations but is a separate concern.
- **Type stub creation** for third-party libraries -- a packaging concern, not a coding standards concern.

## Sources

- minimaxir's Python CLAUDE.md (type hints required, Literal preference, avoid Any)
- Dagster's "Dignified Python" (strict typing philosophy)
- mypy documentation on strict mode and type narrowing
- PEP 484 (Type Hints), PEP 586 (Literal Types), PEP 604 (Union syntax with |)
