---
name: TestDriven
description: Test-driven development philosophy and smart testing methodology. USE WHEN writing tests OR designing test strategy OR refactoring code with tests OR reviewing test quality OR discussing TDD OR characterization testing OR catching regressions OR tests keep breaking after refactoring OR AI refactored code OR AI generated tests. Contains 5 core principles from authoritative sources for writing tests that survive refactoring.
---

# TestDriven

5 core principles from authoritative sources for writing tests that **survive refactoring and catch real regressions**.

**Core insight:** If you have to change your tests to make them pass after a legitimate refactoring, your tests are testing the wrong thing.

## Skill Type: Reference + Workflow

This skill provides **principles for test quality** plus **four actionable workflows** for common testing scenarios.

---

## Workflow Routing

| Trigger | Workflow | Use When |
|---------|----------|----------|
| "write tests", "add tests", "test this", "how do I test" | `Workflows/WriteTests.md` | Writing tests for new or existing code |
| "review tests", "test quality", "PR review", "audit tests" | `Workflows/ReviewTests.md` | Evaluating test quality in code review |
| "diagnose test", "fix test", "test breaking", "test failing after refactor" | `Workflows/DiagnoseTest.md` | Fixing broken or flaky tests |
| "AI refactored", "AI generated", "validate AI", "copilot", "claude refactored" | `Workflows/AIValidation.md` | Validating AI-refactored code or AI-generated tests |

**Philosophy questions, test strategy, learning** → Use Reference Mode (see Core Principles below)

---

## Core Principles

| # | Principle | Source | Key Question |
|---|-----------|--------|--------------|
| 1 | **FIRST** | Robert C. Martin, "Clean Code" (2008) | Fast, Independent, Repeatable, Self-Validating, Timely? |
| 2 | **Behavior Over Implementation** | Kent Beck, Michael Feathers | Would test pass if I rewrote with different algorithm? |
| 3 | **Test Pyramid** | Martin Fowler (2012) | Many unit, fewer integration, even fewer E2E? |
| 4 | **Characterization Tests** | Michael Feathers, "Working Effectively with Legacy Code" (2004) | Am I changing code I don't understand? |
| 5 | **Red-Green-Refactor** | Kent Beck, "TDD by Example" (2002) | Did I write failing test first? |

---

## Quick Decision Tree

**Start here when testing:**

```
Is this legacy/unfamiliar code?
├─ YES → Characterization Tests (Rules/CharacterizationTests.md)
│        Capture behavior before changing
│
└─ NO → Is this new development?
        ├─ YES → Red-Green-Refactor (Rules/RedGreenRefactor.md)
        │        Write failing test first, then implement
        │
        └─ NO → Are tests breaking on refactoring?
                ├─ YES → Behavior Over Implementation (Rules/BehaviorOverImplementation.md)
                │        Tests are coupled to implementation
                │
                └─ NO → Is test suite slow/flaky?
                        ├─ YES → Test Pyramid (Rules/TestPyramid.md)
                        │        Likely ice cream cone anti-pattern
                        │
                        └─ NO → FIRST (Rules/FIRST.md)
                                Evaluate individual test quality
```

---

## Priority When Stuck

When multiple principles apply and conflict:

1. **Behavior Over Implementation** (wins for new/understood code)
2. **Characterization Tests** (wins for legacy/unknown code)
3. **Test Pyramid** (wins for test suite design)
4. **FIRST** (wins for individual test quality)
5. **Red-Green-Refactor** (wins for development workflow)

---

## Notable Anti-Pattern

**Don't Mock What You Don't Own** (Gerard Meszaros, "xUnit Test Patterns")

Don't mock third-party libraries directly. When the library changes, your mocks become lies. Wrap external dependencies and mock your wrapper.

```pseudocode
// BAD: Mocking third-party library
twilio = mock()
twilio.messages.create.returns({sid: "123"})

// GOOD: Wrap and mock your wrapper
class SmsGateway:
    function send(to, message): ...

fake_gateway = FakeSmsGateway()  // Mock your own interface
```

See: `Rules/BehaviorOverImplementation.md` (Mock at Boundaries section)

---

## Examples

**Example 1: Implementation-Coupled Test (Bad)**

```pseudocode
// This test breaks when you change the SQL query or add caching
function test_get_users():
    db = mock()
    db.execute.returns([user_data])
    service = UserService(db)

    service.get_active_users()

    // Coupled to exact SQL - breaks on any query change
    assert db.execute.was_called_with("SELECT * FROM users WHERE active = 1")
```
→ Problem: Tests HOW (the query), not WHAT (returns active users)
→ See: `Rules/BehaviorOverImplementation.md`

**Example 2: Behavior-Based Test (Good)**

```pseudocode
// This test survives query changes, ORM migration, caching, etc.
function test_get_active_users_returns_only_active():
    service = UserService(test_database)
    service.create_user("alice", active=true)
    service.create_user("bob", active=false)

    result = service.get_active_users()

    // Tests WHAT we get, not HOW we get it
    assert length(result) == 1
    assert result[0].name == "alice"
```
→ Survives: query rewrites, ORM changes, caching layer, database migration
→ See: `Rules/BehaviorOverImplementation.md`

**Example 3: Characterization Test for Legacy Code**

```pseudocode
// Unknown legacy code - capture current behavior first
function test_process_order_characterization():
    sample_orders = load_production_samples()

    for order in sample_orders:
        result = process_order(order)
        assert result == load_expected_result(order.id)

// Now you can refactor safely - test detects unintended changes
```
→ Use: When inheriting code you don't fully understand
→ See: `Rules/CharacterizationTests.md`

---

## Principle Files

Each principle file in `Rules/` includes:
- Source attribution
- Impact level and why it matters
- Problem: Anti-pattern with code example
- Solution: Correct pattern with code example
- "The Test Question" - Self-check to evaluate your tests

### Rule File Index

| File | Principle | When to Read |
|------|-----------|--------------|
| `Rules/FIRST.md` | Fast, Independent, Repeatable, Self-Validating, Timely | Evaluating individual test quality |
| `Rules/BehaviorOverImplementation.md` | Test WHAT, not HOW | Tests break after refactoring |
| `Rules/TestPyramid.md` | Many unit, few E2E | Test suite slow or flaky |
| `Rules/CharacterizationTests.md` | Capture before changing | Working with legacy code |
| `Rules/RedGreenRefactor.md` | Red → Green → Refactor | TDD workflow |

---

## Integration with Other Skills

TestDriven provides testing philosophy that complements language-specific coding skills:

- `skills/PythonCoding/` - Python syntax and pytest patterns
- `skills/CSharp/` - C# syntax and xUnit/NUnit patterns
- `skills/VercelReact/` - React Testing Library patterns

**When writing tests:** Apply TestDriven principles first (WHAT to test), then language-specific skill patterns (HOW to write it).

---

## Authoritative Sources

| Source | Author | Year | Key Contribution |
|--------|--------|------|------------------|
| Test-Driven Development by Example | Kent Beck | 2002 | Red-Green-Refactor, behavior testing |
| Working Effectively with Legacy Code | Michael Feathers | 2004 | Characterization tests, seams |
| Clean Code, Chapter 9 | Robert C. Martin | 2008 | FIRST principles |
| TestPyramid | Martin Fowler | 2012 | Test distribution model |
| xUnit Test Patterns | Gerard Meszaros | 2007 | Test doubles, anti-patterns |
