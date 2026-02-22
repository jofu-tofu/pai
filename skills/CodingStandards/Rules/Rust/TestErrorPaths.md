### RS8.6 TestErrorPaths

**Impact: HIGH (Untested error paths silently rot; when they finally execute in production, they panic or return wrong values)**

Error handling code is code. It needs tests. Use `#[should_panic]` for functions that must panic under specific conditions, and return `Result<(), E>` from test functions to use `?` for setup while asserting specific error variants. Testing only the happy path leaves the majority of branches unverified.

**Incorrect: Only testing the success path**

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_valid_config() {
        let cfg = Config::from_str("port=8080\nhost=localhost").unwrap();
        assert_eq!(cfg.port, 8080);
        assert_eq!(cfg.host, "localhost");
    }
    // No test for missing fields, invalid port, malformed lines,
    // empty input, duplicate keys...
}
```

**Correct: Comprehensive error path coverage**

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_valid_config() {
        let cfg = Config::from_str("port=8080\nhost=localhost").unwrap();
        assert_eq!(cfg.port, 8080);
    }

    #[test]
    fn rejects_missing_port() {
        let err = Config::from_str("host=localhost").unwrap_err();
        assert!(matches!(err, ConfigError::MissingField(f) if f == "port"));
    }

    #[test]
    fn rejects_invalid_port() {
        let err = Config::from_str("port=abc\nhost=localhost").unwrap_err();
        assert!(matches!(err, ConfigError::InvalidValue { field, .. } if field == "port"));
    }

    #[test]
    fn rejects_empty_input() {
        let err = Config::from_str("").unwrap_err();
        assert!(matches!(err, ConfigError::EmptyInput));
    }

    #[test]
    #[should_panic(expected = "invariant violated")]
    fn panics_on_invariant_violation() {
        Config::dangerous_unchecked(0, "");
    }

    #[test]
    fn result_returning_test() -> Result<(), ConfigError> {
        let cfg = Config::from_str("port=8080\nhost=localhost")?;
        assert_eq!(cfg.port, 8080);
        Ok(())
    }
}
```

**When acceptable:**
- Infallible functions that genuinely cannot fail (pure arithmetic on bounded inputs, newtype wrappers)
- Error paths that are already covered by integration or property-based tests at a higher level
