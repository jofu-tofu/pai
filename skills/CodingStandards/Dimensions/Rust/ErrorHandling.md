# Error Handling -- Rust

> Make every failure mode explicit in the type system, preserve the full causal chain, and place the recovery decision at the correct layer of the call stack.

## Mental Model

Rust's error handling is built on a single design choice: errors are values, not control flow. `Result<T, E>` forces every caller to acknowledge that a function can fail, and the compiler refuses to let you ignore it. This is the foundation, but it is not enough on its own. Without discipline, Rust code accumulates `unwrap()` calls that turn recoverable errors into panics, monolithic error enums that force callers to handle impossible variants, and bare `?` chains that propagate errors without any context about what the program was trying to do.

The error handling dimension organizes around a key architectural boundary: **libraries vs. applications**. Libraries exist to serve callers they cannot predict, so they must expose structured, typed errors that callers can match on. Applications exist to serve users, so they need ergonomic error reporting with full context chains. This boundary determines which crate to use (`thiserror` vs. `anyhow`), whether to panic or return `Result`, and how granular the error types should be.

Within libraries, the primary constraint is **no panics in public APIs**. A panic in a library is a unilateral decision to terminate the caller's process. The library does not know whether the caller is a CLI tool (where a crash is acceptable) or an HTTP server (where a crash kills all in-flight requests). Every public function should return `Result`, and `expect()` should only appear where the invariant is provably guaranteed at compile time.

Error type granularity follows from the caller's needs. If callers need to match on failure modes -- retry on timeout, abort on invalid input, prompt on authentication failure -- the error must be a typed enum with one variant per actionable case. If callers only need to report the error to a user or log, an erased error (`anyhow::Error`) eliminates the maintenance cost of variant enums nobody inspects.

The final principle is **context preservation**. Rust's `?` operator is powerful but lossy: it converts and propagates the error but does not explain what the program was trying to accomplish. Adding `.context()` or `.map_err()` at every `?` site produces error chains like "failed to initialize pipeline: failed to read config: config.toml: permission denied" -- messages that are immediately actionable without a debugger.

## Consumer Guide

### When Reviewing Code

Look for these signals: `unwrap()` or `expect()` in library code without a comment justifying the invariant. Bare `?` without `.context()` or `.map_err()` in functions more than a few lines long. A single error enum shared across the entire crate with variants that only apply to one module. `anyhow::Result` in a public library API. Manual `impl Error` that omits `source()`. `match` on `Result` where every arm just propagates -- this should be `?`. These patterns each indicate a specific failure in the error handling strategy.

### When Designing / Planning

Decide the library/application boundary first. For each public module, list the failure modes callers need to distinguish and create one error enum per module with only those variants. For internal modules, decide whether callers need to match on errors or just report them -- this determines typed vs. erased. Plan the context strategy: each layer of the call stack should add one sentence of context describing the operation it was attempting.

### When Implementing

Use `thiserror` for every library error type. Use `anyhow` in application code and binary crate entry points. Never call `unwrap()` in library code; use `ok_or()`, `ok_or_else()`, or `expect()` with an invariant explanation. Add `.context()` or `.with_context()` to every `?` in functions that are not trivial one-liners. Prefer `?` over `match` for propagation; use `match` only when you need to handle specific variants. Implement `source()` on every custom error that wraps another error.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [ThiserrorForLibsAnyhowForApps](../../Rules/Rust/ThiserrorForLibsAnyhowForApps.md) | CRITICAL | Use thiserror in libraries for typed errors; anyhow in applications for ergonomic reporting |
| [NoPanicInLibraries](../../Rules/Rust/NoPanicInLibraries.md) | CRITICAL | Libraries must never panic; return Result and let callers decide on recovery |
| [ErrorTypeGranularity](../../Rules/Rust/ErrorTypeGranularity.md) | HIGH | Define error enums at module level with only variants the caller can encounter |
| [ContextualErrors](../../Rules/Rust/ContextualErrors.md) | HIGH | Attach .context() or .map_err() when propagating with ? to preserve the causal chain |
| [ErrorTraitImplementation](../../Rules/Rust/ErrorTraitImplementation.md) | HIGH | Custom errors must implement Error + Display + Debug with source() for chain traversal |
| [QuestionMarkOverMatch](../../Rules/Rust/QuestionMarkOverMatch.md) | MEDIUM | Prefer ? for propagation, match for variant-specific handling, combinators for transforms |
| [TypedVsErasedErrors](../../Rules/Rust/TypedVsErasedErrors.md) | MEDIUM | Typed enums when callers match on variants; erased errors when callers only report |

## Rule Interactions

**ThiserrorForLibsAnyhowForApps + TypedVsErasedErrors**: These two rules address the same decision from different angles. The library/application boundary (RS2.1) determines the crate; the typed/erased distinction (RS2.7) determines the strategy within each side. A library uses thiserror and typed enums; an application uses anyhow and erased errors. Together they form a complete error architecture.

**NoPanicInLibraries + ErrorTypeGranularity**: The no-panic rule (RS2.2) forces library functions to return `Result`, which creates the need for well-designed error types. Granularity (RS2.3) ensures those error types are useful rather than a dumping ground of every possible failure.

**ContextualErrors + ErrorTraitImplementation**: Context (RS2.4) attaches operational meaning at each call site; the Error trait's `source()` method (RS2.5) ensures those layers form a traversable chain. If either is missing, the error message is incomplete: no context means "what was I doing?" is lost, no `source()` means "what went wrong underneath?" is lost.

**QuestionMarkOverMatch + ContextualErrors**: The `?` operator (RS2.6) makes propagation concise, but bare `?` drops context. These rules work together: use `?` for propagation, but attach `.context()` before the `?` to preserve meaning.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **`unwrap()` in library public APIs**: Converts a recoverable error into a process-terminating panic. The caller has no opportunity to handle the failure, retry, or report gracefully. This is the highest-severity error handling defect in Rust.
- **`anyhow::Result` as a library's public return type**: Strips callers of the ability to match on error variants. The library has made a unilateral decision that all callers only need to report errors, which is rarely true.

### HIGH

- **Bare `?` propagation through multiple layers**: Produces error messages like "No such file or directory" with no indication of which file or what operation failed. Debugging requires a stack trace or stepping through code.
- **Single crate-wide error enum with 15+ variants**: Forces every caller to handle or wildcard-match variants that cannot occur in their code path. The compiler's exhaustiveness checking becomes noise rather than signal.
- **Manual `impl Error` without `source()`**: Breaks the error chain so that error reporters (anyhow's `{:#}`, tracing's error fields) cannot display the root cause.

### MEDIUM

- **`match` on Result where every arm just returns Err(e.into())**: This is `?` with extra syntax. The match provides no additional handling, only visual noise.
- **Typed error enums that no caller ever matches on**: If every call site uses `?` to propagate and no code inspects the variants, the enum is wasted ceremony. Switch to anyhow or `Box<dyn Error>`.

## Does Not Cover

- **Panic recovery and catch_unwind** -- this dimension covers preventing panics, not recovering from them. `catch_unwind` is a separate concern for FFI boundaries and thread isolation.
- **Async error handling** -- Pin, futures, and the interaction between `?` and async blocks have additional complexity not covered here.
- **Logging and observability** -- this dimension ensures errors carry context; the choice of tracing framework, log levels, and structured logging fields is a separate concern.
- **Retry and backoff strategies** -- deciding whether to retry is an application-level concern that sits above the error type design covered here.
- **Error serialization for APIs** -- converting Rust errors to HTTP status codes, JSON error bodies, or gRPC status is an API design concern.

## Sources

- Effective Rust (ER) -- Items 3, 4, 18 on error handling idioms
- Luca Palmieri, "Error Handling In Rust - A Deep Dive" (thiserror/anyhow architecture)
- anyhow documentation (context chaining, error reporting)
- thiserror documentation (derive macros, source/from attributes)
- Rust API Guidelines (C-GOOD-ERR): error type design for public APIs
- The Rust Book, Chapter 9.2: Recoverable Errors with Result
- Comprehensive Rust (CRUST) -- error propagation patterns
