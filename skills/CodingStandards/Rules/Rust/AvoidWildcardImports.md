### RS10.5 AvoidWildcardImports

**Impact: MEDIUM (Wildcard imports cause name collisions and obscure where symbols originate)**

Glob imports (`use foo::*`) pull every public symbol into scope. When two glob imports export the same name, the code fails to compile. Even without collisions, readers cannot determine where a type or function comes from without checking every imported module. Explicit imports serve as documentation.

**Incorrect: Wildcard imports causing ambiguity and collision**

```rust
use std::io::*;
use std::fmt::*;

// Both modules export `Result` and `Error`
// This fails to compile:
fn process() -> Result<String> {  // ambiguous: io::Result or fmt::Result?
    Ok("done".to_string())
}

// Even without collision, the reader cannot tell where `BufReader` comes from
use crate::parsing::*;
use crate::networking::*;

fn handle(stream: TcpStream) {
    let reader = BufReader::new(stream);  // from parsing? networking? std::io?
    let msg = decode(reader);             // which module defines decode()?
}
```

**Correct: Explicit imports document origin**

```rust
use std::io::{self, BufReader, Read};
use std::fmt;

fn process() -> io::Result<String> {
    Ok("done".to_string())
}

use crate::parsing::decode;
use crate::networking::TcpStream;

fn handle(stream: TcpStream) {
    let reader = BufReader::new(stream);  // clearly from std::io
    let msg = decode(reader);             // clearly from crate::parsing
}
```

**When acceptable:**
- Test modules: `use super::*` in `#[cfg(test)] mod tests` is idiomatic for accessing all items under test
- Crate-defined preludes: `use mycrate::prelude::*` when the prelude is intentionally curated and small
- Enum variants in match arms: `use MyEnum::*` inside a function to reduce repetition
