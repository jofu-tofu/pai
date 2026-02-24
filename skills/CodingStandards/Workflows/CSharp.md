# CSharp Workflow

> **Trigger:** File signals: `.cs`, `.csproj`, `.sln`, ASP.NET files, `using` statements, `namespace` declarations, `await`/`async` in C# context

## Purpose

Apply C# and .NET coding standards covering type design, null safety, async patterns, member design, and maintainability across 18 rules in 5 priority categories.

## Reference Material

- `../Dimensions/CSharp/` — 18 rules inlined across 5 categories

## Quick Decision Tree

**Start here when writing/reviewing C#:**

1. **Null reference issues?** → Category 2: Null Safety (CRITICAL)
2. **Class design problems?** → Category 1: Type Design (CRITICAL)
3. **Async/await confusion?** → Category 3: Async Patterns (HIGH)
4. **Method signature issues?** → Category 4: Member Design (HIGH)
5. **Code readability concerns?** → Category 5: Maintainability (MEDIUM)

**For detailed implementation:** Read the relevant dimension file from `../Dimensions/CSharp/` folder (rules are inlined).

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

## How to Use Rules

**Pattern:** When applying a rule, find it in the relevant dimension file from `../Dimensions/CSharp/` (rules are inlined).

```
Decision tree identifies: Category 2 (Null Safety)
Quick ref shows: EnableNullableContext rule
Action: Read ../Dimensions/CSharp/EnableNullableContext.md (rule is inlined in the dimension file)
Result: Complete code examples and implementation guidance
```

### Rule File Naming Convention

Rules use TitleCase naming for PAI compliance:
- `enable-nullable-context` → search in the relevant dimension file
- `single-responsibility` → search in the relevant dimension file
- `cancellation-tokens` → search in the relevant dimension file

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

## Dimensional Loading

For agents that need focused subsets rather than the full rule set, read `../Dimensions/CSharp/INDEX.md` for a routing table.

| Dimension | File | Rule Count | Load When |
|-----------|------|------------|-----------|
| Architecture | Architecture.md | 4 | Type design, class responsibilities, composition |
| Null Safety | NullSafety.md | 4 | Nullable context, null guards, required properties |
| Async Patterns | AsyncPatterns.md | 4 | async/await, cancellation tokens, sync/async mixing |
| Member Design | MemberDesign.md | 6 | Method signatures, immutable returns, visibility |

**Default:** Load Architecture for any C# task.

**Use the full workflow (this file) when:** comprehensive standards review for a complete class or module.

**Use a dimension when:** focused context for a specific concern, multi-agent review, or constrained-context scenarios.
