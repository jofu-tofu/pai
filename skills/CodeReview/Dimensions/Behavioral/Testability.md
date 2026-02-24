---
id: B5
name: Testability
category: Behavioral
baseline: false
---

# Testability Review

> Evaluate whether the code is structured so its correctness can be verified through tests — injectable dependencies, deterministic logic, isolated side effects, and test accompaniment.

## Mental Model

Testable code separates what it *decides* from what it *does*. When business logic is entangled with infrastructure — database calls inside calculations, timestamps embedded in conditionals, constructors that bootstrap the world — the only way to test is to replicate the entire environment. The reviewer's job is to spot structural choices that make test isolation impossible or prohibitively expensive, and to verify that behavioral changes arrive with corresponding test changes.

This dimension evaluates two complementary concerns: **code-level structure** (are dependencies injectable? are side effects isolated?) and **change-level discipline** (do behavioral changes come with tests? do bug fixes include regression tests?).

## Detection Heuristics (ordered by severity)

### CRITICAL

- **Hidden dependency in constructor/initializer** — A class or module fetches collaborators internally via `new`, service locator, or static method call instead of receiving them as parameters. Tests cannot substitute dependencies without monkey-patching or framework-specific hacks. Look for: `this.db = new Database()`, `this.logger = Logger.getInstance()`, `const config = require('./config')` inside constructors. *Paradigm note:* This applies to class-based code. In functional/component paradigms, framework-idiomatic dependency patterns — React hooks like `useContext()`, Svelte `getContext()`, Angular `inject()` — are framework-managed injection, not hidden dependencies. Flag only when these patterns are used outside their intended scope or when a non-framework dependency is hardcoded. *(Source: Hevery Flaw #1 — "Constructor does Real Work"; Fowler — Dependency Injection pattern)*

- **Non-deterministic dependency without seam** — Code calls `Date.now()`, `Math.random()`, `crypto.randomUUID()`, file system APIs, or network APIs directly without an injectable wrapper or abstraction boundary. Tests cannot control inputs or predict outputs, leading to flaky or untestable assertions. Look for: bare `new Date()` in business logic, direct `fetch()` calls in domain functions, `fs.readFileSync()` in calculation methods. *Paradigm note:* This applies universally across all paradigms — functional, OOP, and component-based code all suffer from embedded non-determinism. *(Source: Hevery Flaw #3 — "Brittle Global State & Singletons"; Microsoft .NET Unit Testing Best Practices)*

### HIGH

- **Shared mutable state across test boundaries** — Global variables, singletons with mutable state, or module-level mutable variables that persist between test runs. Tests pass individually but fail when run together or in different orders, creating phantom failures that erode trust in the test suite. Look for: `let cache = {}` at module scope, singleton patterns with accumulated state, static mutable fields. *(Source: Hevery Flaw #3; Google Testing Blog — "Testing on the Toilet: Global State")*

- **Constructor over-work** — Constructor or initializer contains conditional logic, loops, I/O operations, or method calls beyond simple field assignment. Every test that instantiates the class must navigate all constructor side effects, making test setup brittle and slow. Look for: `if`/`switch` in constructors, method calls like `this.initialize()` or `this.validate()` in constructors, try/catch blocks in constructors. *Paradigm note:* Applies to class-based code. In functional paradigms, the equivalent is factory functions that perform I/O or complex computation — flag those instead. *(Source: Hevery Flaw #1 — "Constructor does Real Work")*

- **Behavioral change without corresponding test change** — The PR diff adds or modifies behavior (new public methods, changed return values, new conditional branches, new API endpoints) but contains zero test file additions or modifications. This heuristic fires only when: (a) changed files have no existing test counterpart (e.g., no `UserService.test.ts` alongside `UserService.ts`), OR (b) new public API surface is introduced without any test. Does NOT fire for pure refactoring that preserves behavior, documentation-only changes, type annotation additions, or performance optimizations that don't alter outputs. The reviewer uses judgment to determine whether existing test coverage is sufficient. *(Source: Microsoft .NET Unit Testing Best Practices; SmartBear Code Review Research)*

### MEDIUM

- **Deep collaborator chain (Law of Demeter violation for testability)** — A method navigates through `a.getB().getC().doThing()`, requiring elaborate mock chains where each mock returns another mock. The test setup becomes fragile and obscures what behavior is actually being verified. Look for: chains of 3+ property accesses or method calls on return values in the same expression. *Paradigm note:* In functional pipelines and component props, deep data access like `props.user.address.city` is common. Evaluate whether destructuring or selecting at the module boundary is feasible — the concern is mock chain complexity, not dot notation per se. *(Source: Hevery Flaw #2 — "Digging into Collaborators"; Law of Demeter — Lieberherr 1987)*

- **Mixed side effects and logic** — A single function combines business decisions (conditionals, calculations, transformations) with I/O operations (database writes, API calls, file mutations) in the same method body. The pure logic cannot be tested without triggering side effects, and the side effects cannot be verified without running the logic. Look for: functions that both compute a result AND write to a database, send an email, or mutate external state. *(Source: Bernhardt — "Functional Core, Imperative Shell"; Martin — Single Responsibility Principle)*

- **Missing regression test for bug fix** — A bug fix PR lacks a test that would fail without the fix and pass with it. The bug is repaired but unprotected against recurrence — the next refactor can silently reintroduce it. Look for: PRs with commit messages referencing bugs, issues, or "fix" in the title that modify source files but add no test files or test cases. *(Source: Microsoft .NET Unit Testing Best Practices; TDD literature — Beck 2002)*

## Severity Calibration

CRITICAL = structural pattern that makes an entire class or module untestable without framework workarounds (mocking frameworks, monkey-patching, container overrides). Requires architectural change to fix.
HIGH = pattern that significantly increases test fragility, setup complexity, or leaves behavioral changes unverified. Should be addressed in this PR.
MEDIUM = pattern that increases test maintenance cost or leaves known bugs unprotected. Flag for awareness and discussion.

## Language-Specific Notes

- **TypeScript/React:** Component dependencies via props are testable by design; direct `useEffect` calls to external APIs create hidden non-deterministic dependencies — prefer custom hooks that accept injectable fetchers. `jest.mock()` is a seam of last resort, not a design tool — if you need it for every test, the code has a DI problem. React Context via `useContext()` is framework-managed injection and is NOT a hidden dependency. Server Components have constrained testability — async data fetching in the component body resists unit testing; extract data-fetching logic into separate functions.

- **Python:** `pytest` fixtures naturally express dependency injection — use them instead of hardcoding collaborators in `__init__`. `monkeypatch` handles non-deterministic dependencies (time, randomness) cleanly. Watch for `__init__.py` files that run module-level code with side effects — these execute on import and poison every test that touches the package. Prefer `@dataclass(frozen=True)` over mutable state classes to eliminate shared-state test interference.

- **Svelte:** Writable stores accessed directly via `$store` syntax inside components create implicit global state coupling — prefer passing store values as props for testable components. Component logic driven by props is straightforward to test with `@testing-library/svelte`; logic buried in `$:` reactive statements with side effects is not. SvelteKit `load` functions are naturally testable (pure input→output) — keep business logic in `load` rather than in component `onMount` handlers.

## Good vs. Bad Examples

### Bad (before)

```typescript
// Hidden dependency: UserService creates its own database connection
// Tests cannot substitute a fake database without monkey-patching
class UserService {
  private db: Database;
  private logger: Logger;

  constructor() {
    this.db = new Database(process.env.DB_URL);  // hidden dependency
    this.logger = Logger.getInstance();            // singleton lookup
  }

  async getUser(id: string): Promise<User> {
    this.logger.info(`Fetching user ${id}`);
    return this.db.query('SELECT * FROM users WHERE id = ?', [id]);
  }
}

// Mixed side effects and logic: calculation and I/O in same function
// Cannot test pricing logic without triggering email and database write
async function processOrder(order: Order): Promise<Receipt> {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  await db.insert('orders', { ...order, total });           // side effect
  await emailService.send(order.email, `Total: $${total}`); // side effect

  return { subtotal, tax, total, orderId: order.id };
}
```

### Good (after)

```typescript
// Injectable dependencies: tests provide fakes via constructor
class UserService {
  constructor(
    private db: DatabasePort,      // injected interface
    private logger: LoggerPort     // injected interface
  ) {}

  async getUser(id: string): Promise<User> {
    this.logger.info(`Fetching user ${id}`);
    return this.db.query('SELECT * FROM users WHERE id = ?', [id]);
  }
}

// Separated: pure calculation + orchestration with side effects
// Pricing logic is independently testable with zero mocks
function calculateOrderTotals(items: OrderItem[]): OrderTotals {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

async function processOrder(
  order: Order,
  db: DatabasePort,
  emailService: EmailPort
): Promise<Receipt> {
  const totals = calculateOrderTotals(order.items);  // pure logic
  await db.insert('orders', { ...order, ...totals });  // isolated side effect
  await emailService.send(order.email, `Total: $${totals.total}`);
  return { ...totals, orderId: order.id };
}
```

## Output Format

For each finding in this dimension, report:
- **Severity:** [CRITICAL/HIGH/MEDIUM]
- **File:** [path]
- **Line:** [range]
- **Heuristic:** [which specific heuristic from above was triggered]
- **Issue:** [1-2 sentences]
- **Recommendation:** [specific fix, not vague]

---

Sources: Hevery, "Guide to Writing Testable Code" (Google, 2008) — Flaws #1-#3; Fowler, "Inversion of Control Containers and the Dependency Injection pattern" (2004); Bernhardt, "Functional Core, Imperative Shell" (Destroy All Software); Microsoft .NET Unit Testing Best Practices; Martin, SOLID Principles (SRP, DIP); SmartBear Code Review Research; Lieberherr, Law of Demeter (1987); Beck, "Test-Driven Development: By Example" (2002); CWE-1054 (Invocation of a Control Element at an Unnecessarily Deep Horizontal Layer).
