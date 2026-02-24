# MUMPS Workflow

> **Trigger:** File signals: `.m`, `.mac`, `.int`, globals (`^`), M commands (`set`, `kill`, `do`, `quit`), special variables (`$h`, `$j`), Chronicles routine/tag syntax

## Purpose

Apply MUMPS (M) coding standards for Chronicles, Caché/IRIS, and GT.M-compatible code across 22 rules in 6 priority categories.

## Reference Material

- `../Dimensions/MUMPS/` - 22 rules inlined across portability, syntax, naming, variables, data access, and locking/error handling.

## Quick Decision Tree

**Start here when writing or reviewing M code:**

1. **Portability or vendor lock-in risk?** -> Category 1: ANSI and Portability (CRITICAL)
2. **Syntax and readability concerns?** -> Category 2: Syntax and Formatting (HIGH)
3. **Routine/tag naming or headers missing?** -> Category 3: Naming and Documentation (HIGH)
4. **Unexpected variable side effects?** -> Category 4: Variables and State (CRITICAL)
5. **Direct global access or raw `$o` loops?** -> Category 5: Data Access and Globals (CRITICAL)
6. **Locking or error trap issues?** -> Category 6: Concurrency and Error Handling (CRITICAL)

## Priority Hierarchy

| Priority | Category | Impact | Key Pattern |
|----------|----------|--------|-------------|
| 1 | ANSI and Portability | CRITICAL | Keep code implementation-independent by default |
| 2 | Syntax and Formatting | HIGH | M is whitespace-sensitive; enforce predictable syntax |
| 3 | Naming and Documentation | HIGH | Routines/tags are APIs; keep names and headers explicit |
| 4 | Variables and State | CRITICAL | Always scope and validate variable usage |
| 5 | Data Access and Globals | CRITICAL | Prefer Chronicles APIs over direct globals |
| 6 | Concurrency and Error Handling | CRITICAL | Lock consistently and initialize standard traps |

## Top 10 High-Impact Rules

1. **PreferAnsiMCore** - Keeps code portable across IRIS and GT.M.
2. **IsolateImplementationSpecificCode** - Vendor-specific behavior stays in dedicated wrappers.
3. **EnforcePortableNameLimits** - Avoid 31-character truncation collisions.
4. **NewVariablesBeforeUse** - Prevents symbol-table leakage across call chains.
5. **AvoidArgumentlessKill** - Prevents accidental symbol-table destruction.
6. **PreferChroniclesApisOverDirectGlobals** - Protects code from data-layout changes.
7. **UseApiLoopingInsteadOfRawOrder** - Avoids brittle direct-global iteration.
8. **AvoidNakedGlobalReferences** - Prevents wrong-node side effects.
9. **UseChroniclesLockWrappers** - Enforces lock semantics with shared tooling.
10. **SetStandardErrorTrap** - Keeps failures observable and recoverable.

## Examples

**Example 1: Portability-safe naming**
```m
; Problem: names that only differ after char 31 can collide
set veryLongRoutineNameForSpecificScenarioA=1
set veryLongRoutineNameForSpecificScenarioB=2

; Prefer: keep identifiers under portable limits and semantically distinct
set ptVisitCounter=1
set ptVisitCounterByDept=2
```

**Example 2: API-first data access**
```m
; Problem: direct global traversal tied to physical structure
set id=""
for  set id=$order(^ERX(id)) quit:id=""  write !,id

; Prefer: API wrappers for durable data access patterns
set id=""
for  set id=$$zoID^%Zelibh(id) quit:id=""  write !,id
```

**Example 3: Locking and error trap hygiene**
```m
; Problem: no standard trap, ad hoc lock behavior
lock +^ERX(123):1 quit:'$test
set ^ERX(123,1)="X"
lock -^ERX(123)

; Prefer: standard trap + lock wrappers
set $zt=$$zZT^%Zelibh()
if '$$zlock^%Zelibh("ERX",123,1) quit
set %=$$zSetItem^%Zelibh("ERX",123,1,"X")
do zunlock^%Zelibh("ERX",123)
```

## How to Use Rules

**Pattern:** Let the decision tree pick a category, then read the relevant dimension file from `../Dimensions/MUMPS/` (rules are inlined).

```
Decision tree identifies: Category 5 (Data Access and Globals)
Quick ref identifies: PreferChroniclesApisOverDirectGlobals
Action: Read ../Dimensions/MUMPS/PreferChroniclesApisOverDirectGlobals.md (rule is inlined in the dimension file)
Result: Concrete standards and examples for safe access patterns
```

## Complete Rule Index

### 1. ANSI and Portability (CRITICAL)
- PreferAnsiMCore
- IsolateImplementationSpecificCode
- EnforcePortableNameLimits
- AvoidNonPortableDeviceCommands

### 2. Syntax and Formatting (HIGH)
- RespectMWhitespaceSensitivity
- KeepCommandSpacingConsistent
- AvoidNullCodeLines
- UseConsistentCommandStyle

### 3. Naming and Documentation (HIGH)
- UseDescriptiveRoutineAndTagNames
- FollowTagStartRules
- IncludeTagParentheses
- MaintainRoutineAndTagHeaders

### 4. Variables and State (CRITICAL)
- NewVariablesBeforeUse
- AvoidArgumentlessKill
- ProtectScratchVariables
- ValidateRequiredParameters

### 5. Data Access and Globals (CRITICAL)
- PreferChroniclesApisOverDirectGlobals
- UseApiLoopingInsteadOfRawOrder
- AvoidNakedGlobalReferences
- AvoidNullValuedSubscripts

### 6. Concurrency and Error Handling (CRITICAL)
- UseChroniclesLockWrappers
- SetStandardErrorTrap

## Source Profile

This workflow prioritizes primary sources:
- Epic Chronicles coding standards and related coding standards wiki content
- Epic GT.M ANSI compatibility guidance
- Official InterSystems documentation
- Official YottaDB/GT.M portability guidance

## Dimensional Loading

For focused context, read `../Dimensions/MUMPS/INDEX.md`.

| Dimension | File | Rule Count | Load When |
|-----------|------|------------|-----------|
| Standards | Standards.md | 12 | ANSI compliance, syntax formatting, naming conventions, portability |
| Safety Patterns | SafetyPatterns.md | 10 | Variable scope, data/globals access, concurrency, error traps |

**Default:** Load Standards for any MUMPS task.

**Use the full workflow (this file) when:** doing full module or routine standards review.

**Use a dimension when:** evaluating one concern in depth, or running targeted multi-agent review.
