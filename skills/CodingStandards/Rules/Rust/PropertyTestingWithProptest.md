### RS8.3 PropertyTestingWithProptest

**Impact: MEDIUM (Discovers edge cases that hand-written examples miss by exploring the input space systematically)**

Property-based tests define invariants that must hold for all inputs, then let the framework generate thousands of random cases. This catches boundary conditions, overflow, and encoding bugs that developers do not anticipate. Always check in `.proptest-regressions` files so that discovered failures become permanent regression tests.

**Incorrect: Only hand-written examples**

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encode_decode_roundtrip() {
        let original = "hello world";
        let encoded = encode(original);
        let decoded = decode(&encoded).unwrap();
        assert_eq!(decoded, original);
        // Only tests one input; misses empty strings, unicode,
        // embedded nulls, very long strings, etc.
    }
}
```

**Correct: Property test covering the full input space**

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use proptest::prelude::*;

    // Hand-written test for documentation value
    #[test]
    fn encode_decode_basic() {
        let decoded = decode(&encode("hello")).unwrap();
        assert_eq!(decoded, "hello");
    }

    // Property test for exhaustive coverage
    proptest! {
        #[test]
        fn roundtrip_any_string(input in "\\PC*") {
            let encoded = encode(&input);
            let decoded = decode(&encoded).unwrap();
            prop_assert_eq!(decoded, input);
        }

        #[test]
        fn encoded_length_bounded(input in "\\PC{0,1000}") {
            let encoded = encode(&input);
            prop_assert!(encoded.len() <= input.len() * 4);
        }
    }
}
```

**When acceptable:**
- Pure glue code that delegates to well-tested libraries without transformation logic
- Tests for UI or I/O interactions where generating meaningful inputs is impractical
- When the invariant is difficult to express without reimplementing the function under test
