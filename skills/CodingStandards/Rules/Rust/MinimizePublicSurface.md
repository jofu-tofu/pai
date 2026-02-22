### RS7.8 MinimizePublicSurface

**Impact: MEDIUM (Every public item is a semver commitment -- less surface means more freedom to evolve)**

Start every item as private. Promote to `pub(crate)` when other modules in the same crate need access, then to `pub(super)` or `pub` only when genuinely required by external consumers. Every `pub` item becomes a permanent contract: changing its signature, removing it, or altering its behavior is a semver-breaking change. A minimal public surface reduces the maintenance burden, shrinks the documentation footprint, and gives you freedom to refactor internals without releasing a new major version.

**Incorrect: Everything public by default**

```rust
// lib.rs -- entire internal machinery is exposed
pub mod parser;
pub mod optimizer;
pub mod codegen;

// parser.rs
pub struct TokenStream { pub tokens: Vec<Token> }
pub struct Token { pub kind: TokenKind, pub span: Span }
pub fn tokenize(input: &str) -> TokenStream { todo!() }
pub fn skip_whitespace(input: &str) -> &str { todo!() }  // internal helper, now public API
pub fn merge_adjacent_strings(tokens: &mut Vec<Token>) { todo!() }  // optimization detail, now public API
```

**Correct: Expose only the intended API surface**

```rust
// lib.rs -- only the facade is public
mod parser;
mod optimizer;
mod codegen;

// Re-export the public API
pub use parser::{parse, Ast};

// parser.rs
pub(crate) struct TokenStream { tokens: Vec<Token> }
struct Token { kind: TokenKind, span: Span }

/// Parses the input string into an AST.
pub fn parse(input: &str) -> Result<Ast, ParseError> { todo!() }

// Internal helpers -- private, free to change at any time
fn tokenize(input: &str) -> TokenStream { todo!() }
fn skip_whitespace(input: &str) -> &str { todo!() }
fn merge_adjacent_strings(tokens: &mut [Token]) { todo!() }
```

**When acceptable:**
- Binary crates (applications) that have no downstream consumers -- visibility is less critical
- Types in integration test modules that need broad access for testing convenience
- When you explicitly want to expose internals for advanced users via a `pub mod internals` escape hatch, documented as unstable
