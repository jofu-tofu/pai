---
name: PythonCoding
description: Python code quality and best practices. USE WHEN writing Python code OR reviewing Python code OR refactoring Python OR debugging Python issues. Contains 18 rules across 5 priority categories for framework-agnostic Python excellence.
---

# PythonCoding

Framework-agnostic Python best practices combining minimaxir's defensive patterns and Dagster's "Dignified Python" principles. **18 rules across 5 categories, prioritized by impact.**

## When to Apply This Skill

**Automatic triggers:**
- Writing Python functions or classes
- Reviewing Python code for quality
- Refactoring Python code
- Debugging Python issues
- Type checking or error handling decisions

## Quick Decision Tree

**Start here when writing/reviewing Python:**

1. **Missing type hints?** → Category 2: Type System (CRITICAL)
2. **Exception handling issues?** → Category 1: Defensive Programming (CRITICAL)
3. **Performance concerns?** → Category 3: Performance (HIGH)
4. **Code organization problems?** → Category 4: Code Organization (HIGH)
5. **Error handling gaps?** → Category 5: Error Handling (MEDIUM)

**For detailed implementation:** Read the specific rule file from `Rules/` folder.

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

## Reference Documentation

**All 18 rules are sharded into individual files in `Rules/` folder for efficient loading.**

### How to Use Rules

**Pattern:** When applying a rule, read its specific file from Rules/ folder.

```
Decision tree identifies: Category 1 (Defensive Programming)
Quick ref shows: DefensiveLbyl rule
Action: Read Rules/DefensiveLbyl.md
Result: Complete code examples and implementation guidance
```

### What's in Each Rule File

Each rule file (`Rules/RuleName.md`) includes:
- Why it matters (explanation + impact level)
- Incorrect code example with explanation
- Correct code example with explanation
- Edge cases and when rule doesn't apply

### Rule File Naming Convention

Rules use TitleCase naming for PAI compliance:
- `defensive-lbyl` → `Rules/DefensiveLbyl.md`
- `type-hints-required` → `Rules/TypeHintsRequired.md`
- `org-keyword-arguments` → `Rules/OrgKeywordArguments.md`

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
