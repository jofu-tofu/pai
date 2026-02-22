### RS8.7 SnapshotAndFuzzTesting

**Impact: MEDIUM (Snapshots catch unintended output changes; fuzzing discovers crashes and panics in parsing code)**

Use `insta` for snapshot testing when outputs are complex structures, formatted text, or serialized data where manual assertions would be fragile. Use `cargo fuzz` for security-sensitive parsing, deserialization, and protocol handling where malformed input could cause panics or undefined behavior.

**Incorrect: Brittle manual assertions on complex output**

```rust
#[test]
fn test_error_report() {
    let report = generate_report(&errors);
    // Fragile: breaks on any formatting change, hard to review
    assert_eq!(report, "Error Report\n============\n\n1. FileNotFound: config.toml\n   at line 12\n\n2. ParseError: invalid syntax\n   at line 45\n");
    // Adding a new field or changing whitespace requires
    // updating this entire string manually
}
```

**Correct: Snapshot testing with insta and fuzz targets**

```rust
// Snapshot test -- complex output verified against saved snapshot
#[cfg(test)]
mod tests {
    use super::*;
    use insta::assert_snapshot;

    #[test]
    fn error_report_format() {
        let report = generate_report(&sample_errors());
        assert_snapshot!(report);
        // First run: creates snapshots/error_report_format.snap
        // Subsequent runs: compares against saved snapshot
        // Review changes with: cargo insta review
    }

    #[test]
    fn structured_output() {
        let output = build_manifest(&config());
        insta::assert_yaml_snapshot!(output);
    }
}

// Fuzz target -- in fuzz/fuzz_targets/parse_message.rs
#![no_main]
use libfuzzer_sys::fuzz_target;
use my_crate::parse_message;

fuzz_target!(|data: &[u8]| {
    // Must not panic on any input
    let _ = parse_message(data);
});
```

**When acceptable:**
- Simple return values where `assert_eq!` is clear and stable (booleans, small numbers, single strings)
- Fuzz testing is overkill for pure business logic that does not handle untrusted binary input
- When snapshot churn from frequent format changes would make reviews noisy -- stabilize the format first
