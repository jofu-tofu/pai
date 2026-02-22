### RS6.5 PreferBindgen

**Impact: MEDIUM (Manual FFI declarations drift from C headers and introduce silent ABI bugs)**

Use `bindgen` to auto-generate FFI bindings from C headers instead of writing `extern "C"` blocks by hand. Manual declarations are error-prone: a changed parameter type, a new field in a struct, or a different calling convention in the C library will silently produce undefined behavior. Bindgen reads the actual header and generates correct, up-to-date bindings.

**Incorrect: Hand-written extern block that can drift**

```rust
// Manually transcribed from mylib.h -- version 2.1
// But mylib was updated to 2.3 and changed result_t to i64...
extern "C" {
    fn mylib_init(flags: u32) -> i32;
    fn mylib_process(data: *const u8, len: usize) -> i32; // was i64!
    fn mylib_shutdown();
}

fn run() {
    unsafe {
        mylib_init(0);
        // Return value truncated from i64 to i32 -- silent data loss
        let result = mylib_process(b"hello".as_ptr(), 5);
        mylib_shutdown();
    }
}
```

**Correct: Bindgen-generated bindings via build.rs**

```rust
// build.rs
fn main() {
    println!("cargo:rerun-if-changed=vendor/mylib.h");
    let bindings = bindgen::Builder::default()
        .header("vendor/mylib.h")
        .allowlist_function("mylib_.*")
        .allowlist_type("mylib_.*")
        .generate()
        .expect("Unable to generate bindings");
    let out_path = std::path::PathBuf::from(
        std::env::var("OUT_DIR").unwrap(),
    );
    bindings
        .write_to_file(out_path.join("bindings.rs"))
        .expect("Couldn't write bindings");
}

// src/ffi.rs
#![allow(non_upper_case_globals, non_camel_case_types)]
include!(concat!(env!("OUT_DIR"), "/bindings.rs"));
```

**When acceptable:**
- Tiny FFI surfaces with one or two stable functions where bindgen adds unnecessary build complexity
- C libraries that do not ship headers (rare) and bindings must be written from documentation
- Projects that vendor pre-generated bindings and audit them on library updates
