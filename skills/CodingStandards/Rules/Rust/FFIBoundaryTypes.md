### RS6.4 FFIBoundaryTypes

**Impact: CRITICAL (Incorrect FFI types cause memory corruption, ABI mismatches, and segfaults)**

Only `Copy` types should be passed by value across FFI boundaries. Strings must use `CString`/`CStr` (never `String` or `&str`). Structs shared with C must be `#[repr(C)]` to guarantee a stable, predictable layout. Without these rules, Rust's default `repr(Rust)` may reorder fields, and non-Copy types may be dropped or aliased incorrectly.

**Incorrect: Rust-repr struct and raw string pointer across FFI**

```rust
// No repr(C) -- Rust compiler may reorder fields arbitrarily.
pub struct SensorReading {
    pub timestamp: u64,
    pub value: f64,
    pub flags: u8,
}

extern "C" {
    fn submit_reading(reading: SensorReading);
    fn set_label(label: *const u8); // expects C string
}

fn send(reading: SensorReading, label: &str) {
    unsafe {
        submit_reading(reading); // ABI mismatch: field order unknown
        set_label(label.as_ptr()); // NOT null-terminated!
    }
}
```

**Correct: repr(C), CString, and proper FFI types**

```rust
#[repr(C)]
pub struct SensorReading {
    pub timestamp: u64,
    pub value: f64,
    pub flags: u8,
}

extern "C" {
    fn submit_reading(reading: SensorReading);
    fn set_label(label: *const std::ffi::c_char);
}

fn send(reading: SensorReading, label: &str) {
    let c_label = std::ffi::CString::new(label)
        .expect("label contained interior null byte");
    unsafe {
        // SAFETY: SensorReading is repr(C) with all Copy fields,
        // matching the C struct definition in sensor.h.
        submit_reading(reading);
        // SAFETY: c_label is a valid, null-terminated C string
        // that lives for the duration of this call.
        set_label(c_label.as_ptr());
    }
}
```

**When acceptable:**
- Opaque pointer handles (`*mut c_void`) where the C side never inspects the Rust layout
- Callbacks using `extern "C" fn` signatures where only primitive types cross the boundary
