# Python Workflow

> **Trigger:** File signals: `.py`, `requirements.txt`, `pyproject.toml`, `setup.py`, `__init__.py`, `poetry.lock`, `Pipfile`

## Purpose

Apply Python coding standards covering defensive programming, type system usage, performance patterns, code organization, and error handling across 18 rules in 5 priority categories.

## Reference Material

- `../Rules/Python/` — 18 individual rule files across 5 categories

## Quick Decision Tree

**Start here when writing/reviewing Python:**

1. **Missing type hints?** → Category 2: Type System (CRITICAL)
2. **Exception handling issues?** → Category 1: Defensive Programming (CRITICAL)
3. **Performance concerns?** → Category 3: Performance (HIGH)
4. **Code organization problems?** → Category 4: Code Organization (HIGH)
5. **Error handling gaps?** → Category 5: Error Handling (MEDIUM)

**For detailed implementation:** Read the specific rule file from `../Rules/Python/` folder.

## Priority Hierarchy

| Priority | Category | Impact | Key Pattern |
|----------|----------|--------|-------------|
| 1 | Defensive Programming | CRITICAL | LBYL, explicit checks, verify runtime |
| 2 | Type System | CRITICAL | Type hints, Literal, avoid Any |
| 3 | Performance | HIGH | O(1) magic methods, defer imports |
| 4 | Code Organization | HIGH | Keyword args, declare close to use |
| 5 | Error Handling | MEDIUM | Context managers, specific exceptions |

## Top 10 High-Impact Rules

These provide the largest code quality gains:

1. **TypeHintsRequired** - Types are documentation that runs
2. **DefensiveLbyl** - Makes intent explicit, reader sees conditions immediately
3. **DefensiveNeverSwallow** - Silent failures cause data corruption
4. **TypeAvoidAny** - Any defeats the purpose of type checking
5. **ErrorContextManagers** - Guarantees resource cleanup
6. **OrgNoMutableDefaults** - Shared mutable default causes data leaks
7. **PerfMagicMethodsO1** - O(n) becomes O(n²) when called implicitly
8. **ErrorSpecificExceptions** - Bare except hides bugs
9. **OrgKeywordArguments** - Self-documenting call sites
10. **DefensivePathChecking** - Prevents OSError on non-existent paths

## Examples

**Example 1: LBYL over EAFP**
```python
# Problem: Exception-based flow hides intent
try:
    value = config[key]
except KeyError:
    value = default

# Solution: DefensiveLbyl rule
value = config.get(key, default)
```

**Example 2: Type Hints Required**
```python
# Problem: No type information
def process(data, threshold):
    return [x for x in data if x > threshold]

# Solution: TypeHintsRequired rule
def process(data: list[float], threshold: float) -> list[float]:
    return [x for x in data if x > threshold]
```

**Example 3: No Mutable Defaults**
```python
# Problem: Shared mutable default
def append_item(item, items=[]):
    items.append(item)
    return items

# Solution: OrgNoMutableDefaults rule
def append_item(item: str, items: list[str] | None = None) -> list[str]:
    if items is None:
        items = []
    items.append(item)
    return items
```

## How to Use Rules

**Pattern:** When applying a rule, read its specific file from `../Rules/Python/` folder.

```
Decision tree identifies: Category 1 (Defensive Programming)
Quick ref shows: DefensiveLbyl rule
Action: Read ../Rules/Python/DefensiveLbyl.md
Result: Complete code examples and implementation guidance
```

### Rule File Naming Convention

Rules use TitleCase naming for PAI compliance:
- `defensive-lbyl` → `../Rules/Python/DefensiveLbyl.md`
- `type-hints-required` → `../Rules/Python/TypeHintsRequired.md`
- `org-keyword-arguments` → `../Rules/Python/OrgKeywordArguments.md`

## Complete Rule Index

### 1. Defensive Programming (CRITICAL)
- DefensiveLbyl
- DefensiveNeverSwallow
- DefensivePathChecking
- DefensiveVerifyCasts

### 2. Type System (CRITICAL)
- TypeHintsRequired
- TypeLiteralValues
- TypeAvoidAny
- TypeOptionalNullable

### 3. Performance (HIGH)
- PerfMagicMethodsO1
- PerfDeferImportTime
- OrgNoMutableDefaults

### 4. Code Organization (HIGH)
- OrgKeywordArguments
- OrgDeclareCloseToUse
- OrgDefaultValuesDangerous
- OrgSingleResponsibility

### 5. Error Handling (MEDIUM)
- ErrorContextManagers
- ErrorSpecificExceptions
- ErrorMeaningfulMessages

## Integration

This skill integrates with PAI's code generation and review workflows. When writing or reviewing Python code, these patterns ensure maintainable, type-safe, and defensive code.

**Sources:** minimaxir's Python CLAUDE.md, Dagster's "Dignified Python"

## Dimensional Loading

For agents that need focused subsets rather than the full rule set, read `../Dimensions/Python/INDEX.md` for a routing table.

| Dimension | File | Rule Count | Load When |
|-----------|------|------------|-----------|
| Defensive Programming | DefensiveProgramming.md | 4 | Input validation, LBYL patterns, path checking |
| Type System | TypeSystem.md | 4 | Type hints, Literal types, avoiding Any |
| Performance | Performance.md | 3 | Magic methods, import deferral, mutable defaults |
| Code Organization | CodeOrganization.md | 7 | Keyword args, declaration scope, error handling |

**Default:** Load Defensive Programming for any Python task.

**Use the full workflow (this file) when:** comprehensive standards review for a complete module.

**Use a dimension when:** focused context for a specific concern, multi-agent review, or constrained-context scenarios.
