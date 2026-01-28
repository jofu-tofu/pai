---
name: CSharp
description: C# and .NET coding guidelines for maintainable code. USE WHEN writing C# code OR reviewing C# code OR refactoring .NET code OR discussing async patterns OR null safety. Contains 18 rules across 5 priority categories for framework-agnostic C# excellence.
---

# CSharp

Framework-agnostic C# best practices combining csharpcodingguidelines.com (AV series) and dotnet-cursor-rules. **18 rules across 5 categories, prioritized by impact.**

## When to Apply This Skill

**Automatic triggers:**
- Writing C# classes or methods
- Reviewing C# code for quality
- Refactoring .NET code
- Implementing async patterns
- Null safety decisions

## Quick Decision Tree

**Start here when writing/reviewing C#:**

1. **Null reference issues?** → Category 2: Null Safety (CRITICAL)
2. **Class design problems?** → Category 1: Type Design (CRITICAL)
3. **Async/await confusion?** → Category 3: Async Patterns (HIGH)
4. **Method signature issues?** → Category 4: Member Design (HIGH)
5. **Code readability concerns?** → Category 5: Maintainability (MEDIUM)

**For detailed implementation:** Read the specific rule file from `Rules/` folder.

## Priority Hierarchy

| Priority | Category | Impact | Key Pattern |
|----------|----------|--------|-------------|
| 1 | Type Design | CRITICAL | Single responsibility, composition |
| 2 | Null Safety | CRITICAL | Nullable context, never return null collections |
| 3 | Async Patterns | HIGH | I/O-bound only, honor cancellation |
| 4 | Member Design | HIGH | Immutable returns, specific parameters |
| 5 | Maintainability | MEDIUM | Small methods, no magic numbers |

## Top 10 High-Impact Rules

These provide the largest code quality gains:

1. **EnableNullableContext** - Compiler catches null bugs before runtime
2. **SingleResponsibility** - Classes with multiple responsibilities break unpredictably
3. **NeverReturnNull** - Eliminates null checks at every call site
4. **NoMixingAsyncSync** - Task.Wait causes deadlocks in sync contexts
5. **PreferComposition** - Inheritance creates fragile hierarchies
6. **CancellationTokens** - Long operations need graceful cancellation
7. **ReturnImmutableCollections** - Prevents callers from mutating internal state
8. **EncapsulateState** - Exposed internals invite misuse
9. **SmallMethods** - Easier to understand, test, and modify
10. **RequiredProperties** - Prevents incomplete object construction (C# 11+)

## Examples

**Example 1: Enable Nullable Context**
```csharp
// Problem: Null reference exceptions at runtime
public class UserService
{
    public string GetName(User user) => user.Name;
}

// Solution: EnableNullableContext rule
#nullable enable
public class UserService
{
    public string GetName(User user) => user.Name ?? string.Empty;
}
```

**Example 2: Never Return Null Collections**
```csharp
// Problem: Every caller must check for null
public List<Order>? GetOrders(int userId) =>
    _orders.ContainsKey(userId) ? _orders[userId] : null;

// Solution: NeverReturnNull rule
public IReadOnlyList<Order> GetOrders(int userId) =>
    _orders.TryGetValue(userId, out var orders) ? orders : [];
```

**Example 3: No Mixing Async/Sync**
```csharp
// Problem: Deadlock in sync contexts
public string GetData()
{
    return GetDataAsync().Result;  // Deadlock risk
}

// Solution: NoMixingAsyncSync rule
public async Task<string> GetDataAsync()
{
    return await FetchFromApiAsync();
}
```

## Reference Documentation

**All 18 rules are sharded into individual files in `Rules/` folder for efficient loading.**

### How to Use Rules

**Pattern:** When applying a rule, read its specific file from Rules/ folder.

```
Decision tree identifies: Category 2 (Null Safety)
Quick ref shows: EnableNullableContext rule
Action: Read Rules/EnableNullableContext.md
Result: Complete code examples and implementation guidance
```

### What's in Each Rule File

Each rule file (`Rules/RuleName.md`) includes:
- Why it matters (explanation + impact level)
- Incorrect code example with explanation
- Correct code example with explanation
- C# version annotations where applicable

### Rule File Naming Convention

Rules use TitleCase naming for PAI compliance:
- `enable-nullable-context` → `Rules/EnableNullableContext.md`
- `single-responsibility` → `Rules/SingleResponsibility.md`
- `cancellation-tokens` → `Rules/CancellationTokens.md`

## Complete Rule Index

### 1. Type Design (CRITICAL)
- SingleResponsibility
- InterfaceSegregation
- PreferComposition
- EncapsulateState

### 2. Null Safety (CRITICAL)
- EnableNullableContext
- NeverReturnNull
- NullConditionalOperators
- RequiredProperties

### 3. Async Patterns (HIGH)
- AsyncForIoBound
- NoMixingAsyncSync
- CancellationTokens
- ConfigureAwaitContext

### 4. Member Design (HIGH)
- ReturnImmutableCollections
- MethodOverProperty
- SpecificParameters

### 5. Maintainability (MEDIUM)
- SmallMethods
- NoMagicNumbers
- PrivateByDefault

## Modern C# Features

This skill includes modern C# features with version annotations:
- `required` keyword (C# 11+) - RequiredProperties rule
- Collection expressions `[]` (C# 12+) - Various examples
- Primary constructors (C# 12+) - Referenced in applicable rules
- File-scoped namespaces (C# 10+) - Standard in examples

## Integration

This skill integrates with PAI's code generation and review workflows. When writing or reviewing C# code, these patterns ensure maintainable, null-safe, and properly async code.

**Sources:** csharpcodingguidelines.com (AV series), dotnet-cursor-rules
