### RS8.1 UnitTestsInSameFile

**Impact: HIGH (Unit tests co-located with code catch regressions immediately and document expected behavior inline)**

Rust's built-in convention places unit tests in a `#[cfg(test)] mod tests` block at the bottom of each source file. This keeps tests physically adjacent to the code they verify, making it trivial to update tests when logic changes and impossible to forget they exist.

**Incorrect: Tests in a separate file mirroring the module**

```rust
// src/parser.rs
pub fn parse_header(input: &str) -> Option<Header> {
    let parts: Vec<&str> = input.splitn(2, ':').collect();
    if parts.len() == 2 {
        Some(Header {
            key: parts[0].trim().to_string(),
            value: parts[1].trim().to_string(),
        })
    } else {
        None
    }
}

// tests/test_parser.rs  <-- separate file, easy to forget, no access to private items
#[test]
fn test_parse_header() {
    let h = parser::parse_header("Content-Type: text/html").unwrap();
    assert_eq!(h.key, "Content-Type");
}
```

**Correct: Test module inside the same file**

```rust
// src/parser.rs
pub fn parse_header(input: &str) -> Option<Header> {
    let parts: Vec<&str> = input.splitn(2, ':').collect();
    if parts.len() == 2 {
        Some(Header {
            key: parts[0].trim().to_string(),
            value: parts[1].trim().to_string(),
        })
    } else {
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_valid_header() {
        let h = parse_header("Content-Type: text/html").unwrap();
        assert_eq!(h.key, "Content-Type");
        assert_eq!(h.value, "text/html");
    }

    #[test]
    fn returns_none_for_missing_colon() {
        assert!(parse_header("InvalidHeader").is_none());
    }
}
```

**When acceptable:**
- Integration tests that exercise the public API across multiple modules belong in `/tests/`, not inline
- Benchmark tests using Criterion belong in `/benches/`
