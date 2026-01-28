---
name: TestDriven
description: Test-driven development philosophy and smart testing methodology. USE WHEN writing tests OR designing test strategy OR refactoring code with tests OR reviewing test quality OR discussing TDD OR characterization testing OR catching regressions OR tests keep breaking after refactoring. Contains 16 principles for writing tests that survive refactoring.
---

# TestDriven

Philosophy and methodology for writing tests that **survive refactoring and catch real regressions**. 16 principles across 5 categories.

**Core insight:** If you have to change your tests to make them pass after a legitimate refactoring, your tests are testing the wrong thing.

## Skill Type: Reference Only

This is a **reference-only skill** - it provides principles and guidance, not active workflows. When this skill activates:

1. Use the **Quick Decision Tree** to identify relevant category
2. Read the specific principle file from `Rules/`
3. Apply the principle's guidance to your testing task

## When to Apply This Skill

**Automatic triggers:**
- Writing new tests for any code
- Designing test strategy for a feature or system
- Refactoring code that has existing tests
- Reviewing test quality or test coverage
- Tests breaking after refactoring (symptom of implementation coupling)
- Working with legacy code that lacks tests
- Discussing TDD philosophy or best practices

## Quick Decision Tree

**Start here when testing:**

1. **Starting new development?** → Category 1: Philosophy (Red-Green-Refactor)
2. **Deciding what to test?** → Category 2: What to Test (CRITICAL)
3. **Tests breaking on refactoring?** → Category 3: Test Resilience (CRITICAL)
4. **Working with legacy code?** → Category 4: Characterization & Legacy
5. **Reviewing test quality?** → Category 5: Anti-Patterns

**For detailed implementation:** Read the specific principle file from `Rules/` folder.

## Core Philosophy

| Principle | Key Question |
|-----------|--------------|
| Test behavior, not implementation | "If I rewrote this with a different algorithm, should the test still pass?" |
| Test at abstraction boundaries | "Is this part of the public API, or could I delete it during refactoring?" |
| Tests should survive refactoring | "Will this test break if I restructure internals without changing behavior?" |

## Priority Hierarchy

| Priority | Category | Impact | Key Principle |
|----------|----------|--------|---------------|
| 1 | What to Test | CRITICAL | Test behavior through public interfaces |
| 2 | Test Resilience | CRITICAL | Avoid implementation coupling |
| 3 | Philosophy | FOUNDATION | Red-Green-Refactor cycle |
| 4 | Characterization | HIGH | Safety net for legacy code |
| 5 | Anti-Patterns | HIGH | Avoid common testing mistakes |

## Top 10 High-Impact Principles

These provide the most value for test quality:

1. **BehaviorNotImplementation** - Test WHAT, not HOW (survives any rewrite)
2. **AbstractionBoundaries** - Test public APIs, not internal classes
3. **SurviveRefactoring** - Tests that break on refactoring are wrong
4. **AvoidImplementationCoupling** - Don't mock internals or assert on private state
5. **TestTheContract** - Input/output, not internal mechanics
6. **RedGreenRefactor** - Failing test → pass → improve design
7. **CharacterizationTests** - Capture legacy behavior before changing
8. **DontMockWhatYouDontOwn** - Wrap third-party APIs
9. **HigherLevelStability** - Integration tests survive restructuring
10. **SkipPrivateHelpers** - Test through public interface only

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
→ See: Rules/BehaviorNotImplementation.md

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
→ See: Rules/BehaviorNotImplementation.md, Rules/AbstractionBoundaries.md

**Example 3: Characterization Test for Legacy Code**
```pseudocode
// Unknown legacy code - capture current behavior first
function test_process_order_characterization():
    sample_orders = load_production_samples()

    for order in sample_orders:
        result = process_order(order)
        // Golden master - detect ANY behavioral change
        assert result == load_expected_result(order.id)

// Now you can refactor safely - test detects unintended changes
```
→ Use: When inheriting code you don't fully understand
→ See: Rules/CharacterizationTests.md, Rules/GoldenMaster.md

## Reference Documentation

**All 16 principles are in individual files in `Rules/` folder for efficient loading.**

### How to Use Rules

**Pattern:** When applying a principle, read its specific file from Rules/.

```
Decision tree identifies: Category 2 (What to Test)
Quick ref shows: BehaviorNotImplementation
Action: Read Rules/BehaviorNotImplementation.md
Result: Complete explanation with examples
```

### What's in Each Principle File

Each principle file (`Rules/PrincipleName.md`) includes:
- Impact level and why it matters
- Problem: Anti-pattern with code example
- Solution: Correct pattern with code example
- "The Test" - Self-check question to evaluate your tests
- Edge cases or when the principle doesn't apply

### Rule File Naming Convention

Rules use TitleCase naming:
- `RedGreenRefactor.md`
- `BehaviorNotImplementation.md`
- `CharacterizationTests.md`

## Complete Principle Index

### 1. Philosophy (FOUNDATION)
- RedGreenRefactor - Write failing test → make it pass → improve design
- TestsAsSpecs - Tests are executable specifications and living documentation
- CleanCodeThatWorks - TDD delivers correctness and maintainability together

### 2. What to Test (CRITICAL)
- BehaviorNotImplementation - Test WHAT the code does, not HOW
- AbstractionBoundaries - Test public interfaces, not internal classes
- TestTheContract - Test input/output, not internal mechanics
- SkipPrivateHelpers - Test through public API; helpers are implementation details

### 3. Test Resilience (CRITICAL)
- SurviveRefactoring - Tests should not break when behavior is unchanged
- AvoidImplementationCoupling - Don't mock internals or assert on private state
- HigherLevelStability - Higher-level tests survive structural changes better

### 4. Characterization & Legacy (HIGH)
- CharacterizationTests - Record existing behavior before changing unknown code
- GoldenMaster - Compare output snapshots to detect any behavioral change
- ReplaceAfterUnderstanding - Upgrade to proper tests once you understand the system

### 5. Anti-Patterns (HIGH)
- AvoidIceCreamCone - Too many E2E tests, too few unit tests = slow and flaky
- DontMockWhatYouDontOwn - Wrap third-party APIs; mock your wrapper
- TestsAreUntestedCode - Keep tests simple; complexity in tests is hidden risk

## Integration

This skill provides testing philosophy that complements language-specific coding skills (PythonCoding, CSharp, VercelReact). Those skills cover syntax and patterns; this skill covers what and how to test.

**When writing tests:** Apply TestDriven principles first (WHAT to test), then language-specific skill patterns (HOW to write it).

**Source:** Kent Beck (TDD), Michael Feathers (Legacy Code), Google SWE Book, xUnit Patterns
