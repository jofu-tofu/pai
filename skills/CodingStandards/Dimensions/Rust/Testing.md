# Testing -- Rust

> Use Rust's built-in test framework, doc tests as living documentation, and property-based testing to verify every path through your code.

## Mental Model

Rust's testing story is unusually strong because the language embeds testing into its core toolchain rather than treating it as an afterthought. The `#[cfg(test)]` attribute means test code is compiled away in release builds, so there is zero cost to placing tests directly alongside the code they verify. This co-location is not just convenient -- it creates a structural guarantee that when you modify a function, its tests are right there demanding your attention.

The framework provides three distinct testing levels, each with a clear purpose. Unit tests live in `#[cfg(test)] mod tests` blocks inside source files and can access private items. Integration tests live in `/tests/` and can only access the public API, verifying the crate as an external consumer would. Doc tests live in `///` comments and serve double duty as documentation and verification -- when a doc example compiles and passes, the documentation is provably correct.

Beyond the built-in framework, Rust's type system creates a natural seam for testability. Because traits define behavior contracts, you can design components against trait interfaces and substitute mocks or fakes in tests without runtime reflection or monkey-patching. This is not a workaround; it is idiomatic Rust design that happens to make testing straightforward.

Property-based testing with `proptest` fills the gap that hand-written examples leave open. A developer writing test cases will think of the obvious boundaries; proptest generates thousands of inputs including empty strings, maximum-length values, unicode edge cases, and combinations that no human would anticipate. When proptest finds a failure, it shrinks the input to the minimal reproducing case and saves it in `.proptest-regressions` files that become permanent regression tests.

For security-sensitive code -- parsers, deserializers, protocol handlers -- fuzzing with `cargo fuzz` takes property testing further by feeding truly random byte sequences into your functions. If any input can cause a panic, buffer overread, or undefined behavior, fuzzing will find it. Snapshot testing with `insta` addresses the opposite problem: complex structured outputs where manual assertions are fragile and review-unfriendly.

The common failure mode in Rust testing is not "no tests" but "only happy-path tests." Error handling in Rust is explicit and pervasive thanks to `Result`, but the error branches are only as reliable as their test coverage. Testing error paths with `unwrap_err()`, `matches!`, and `#[should_panic]` is what turns Rust's type-level safety guarantees into runtime confidence.

## Consumer Guide

### When Reviewing Code

Check that every source file with logic has a `#[cfg(test)] mod tests` block. Look for `unwrap()` in production code that lacks a corresponding test proving the unwrap is safe. Verify that error variants returned by functions have dedicated test cases, not just the success path. For public API items, confirm doc comments include runnable `/// # Examples` blocks. If the crate uses proptest, ensure `.proptest-regressions` files are checked into version control. Flag integration tests that import private modules via `#[path]` hacks -- they should use only the public API.

### When Designing / Planning

Identify external dependencies (HTTP clients, databases, file systems) early and define trait interfaces for them so that test doubles can be substituted without architectural gymnastics. Decide which modules handle untrusted input and plan fuzz targets for them. For modules producing complex structured output (reports, serialized formats, rendered templates), plan snapshot tests from the start rather than writing brittle string assertions.

### When Implementing

Place `#[cfg(test)] mod tests` at the bottom of every file that contains logic. Start with a test for the happy path, then immediately write tests for each error variant your function can return. Add `/// # Examples` to every public function and type. Use `proptest` for any function that transforms, encodes, or parses data -- the roundtrip property (`decode(encode(x)) == x`) is almost always applicable. Run `cargo test --doc` in CI to catch stale documentation. For parsing or deserialization code that handles untrusted input, set up a `cargo fuzz` target early.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [UnitTestsInSameFile](../../Rules/Rust/UnitTestsInSameFile.md) | HIGH | Place `#[cfg(test)] mod tests` at the bottom of each source file with `use super::*` |
| [IntegrationTestsInTestsDir](../../Rules/Rust/IntegrationTestsInTestsDir.md) | HIGH | Use `/tests/` for public API tests; shared helpers in `/tests/common/mod.rs` |
| [PropertyTestingWithProptest](../../Rules/Rust/PropertyTestingWithProptest.md) | MEDIUM | Use proptest for input-space exploration; check in `.proptest-regressions` |
| [TraitBasedMocking](../../Rules/Rust/TraitBasedMocking.md) | HIGH | Design with traits for testability; use mockall for auto-generated mocks |
| [DocTestsAsExamples](../../Rules/Rust/DocTestsAsExamples.md) | MEDIUM | Write `///` examples that serve as both documentation and tests |
| [TestErrorPaths](../../Rules/Rust/TestErrorPaths.md) | HIGH | Test error cases with `unwrap_err()`, `matches!`, `#[should_panic]`, and `-> Result` |
| [SnapshotAndFuzzTesting](../../Rules/Rust/SnapshotAndFuzzTesting.md) | MEDIUM | Use insta for snapshot tests; cargo fuzz for security-sensitive parsing |

## Rule Interactions

**UnitTestsInSameFile + IntegrationTestsInTestsDir**: These rules define a clear two-tier testing strategy. Unit tests in the source file verify internal logic and can access private items. Integration tests in `/tests/` verify the public API as an external consumer. Mixing these levels (integration logic in unit tests, or private-access hacks in integration tests) undermines the separation.

**TraitBasedMocking + UnitTestsInSameFile**: Trait-based design makes unit tests fast and deterministic by eliminating external dependencies. When a struct depends on a trait, the co-located unit test module can substitute a mock without any infrastructure setup.

**PropertyTestingWithProptest + TestErrorPaths**: Property tests naturally exercise error paths because generated inputs include invalid, empty, and boundary values. A roundtrip property test that exercises `parse(serialize(x))` will hit error paths in the parser that hand-written tests miss.

**DocTestsAsExamples + IntegrationTestsInTestsDir**: Doc tests verify that individual API items work as documented. Integration tests verify that multiple API items compose correctly. Together, they cover both the "does each piece work?" and "do the pieces fit together?" questions.

## Anti-Patterns (Severity Calibration)

### HIGH

- **No `#[cfg(test)]` module in files with logic**: Every file that contains conditional logic, error handling, or data transformation should have co-located tests. Files without tests are files whose behavior is unverified.
- **Only happy-path tests**: A test suite that only calls `.unwrap()` on results and never tests error variants provides false confidence. The error branches will execute first in production, not in the test suite.
- **Concrete dependencies in business logic**: Hardcoding `reqwest::Client`, `std::fs`, or database connection types into structs makes testing require live infrastructure. Extract a trait first.
- **Integration tests importing private modules**: Using `#[path = "../src/internal.rs"]` in integration tests defeats their purpose. Integration tests must use only the public API.

### MEDIUM

- **Missing doc tests on public API**: Public functions and types without `/// # Examples` blocks are undocumented in a way that will not be caught by CI. Even `cargo doc` will not warn about missing examples.
- **`.proptest-regressions` not in version control**: When proptest finds a failing case, it writes the minimal reproduction to a regressions file. If this file is gitignored, the regression will be rediscovered and re-reported on every CI run.
- **Snapshot tests without `cargo insta review` in workflow**: Snapshots that are updated blindly with `--accept` without human review defeat the purpose of snapshot testing.

## Does Not Cover

- **CI pipeline configuration** -- how to set up `cargo test`, `cargo fuzz`, and `cargo insta` in CI systems is operational, not a coding standard.
- **Test data management** -- fixtures, factory patterns, and test database seeding strategies are project-specific.
- **Code coverage thresholds** -- this dimension prescribes what to test, not a numeric coverage target.
- **Performance benchmarking** -- Criterion-based benchmarking is a separate concern from correctness testing.

## Sources

- The Rust Programming Language (RBOOK), Chapter 11: Writing Automated Tests (11.1 unit tests, 11.3 integration tests)
- The Rust Programming Language (RBOOK), Chapter 14.2: Publishing a Crate -- documentation examples
- Effective Rust (ER), Item 30: Write more than unit tests
- Rust API Guidelines, C-EXAMPLE: Function examples
- proptest crate documentation: https://docs.rs/proptest
- Palmieri, "Property-Based Testing in Rust with Proptest"
- mockall crate documentation: https://docs.rs/mockall
- insta crate documentation: https://docs.rs/insta
- cargo-fuzz documentation: https://rust-fuzz.github.io/book/cargo-fuzz.html
