### RS5.7 DefaultTraitImplementations

**Impact: MEDIUM (Default methods minimize the burden on implementors and make traits evolvable)**

A trait with many required methods forces every implementor to write boilerplate even when most methods have an obvious default behavior. Providing default implementations for methods that have a sensible baseline lets implementors override only what differs for their type. This also makes traits forward-compatible: adding a new method with a default does not break existing implementors.

**Incorrect: All methods required -- implementor writes redundant boilerplate**

```rust
trait Logger {
    fn log_debug(&self, msg: &str);
    fn log_info(&self, msg: &str);
    fn log_warn(&self, msg: &str);
    fn log_error(&self, msg: &str);
    fn enabled(&self) -> bool;
}

// Every implementor must define all 5 methods even if behavior is standard
struct FileLogger;

impl Logger for FileLogger {
    fn log_debug(&self, msg: &str) { eprintln!("[DEBUG] {msg}"); }
    fn log_info(&self, msg: &str)  { eprintln!("[INFO] {msg}"); }
    fn log_warn(&self, msg: &str)  { eprintln!("[WARN] {msg}"); }
    fn log_error(&self, msg: &str) { eprintln!("[ERROR] {msg}"); }
    fn enabled(&self) -> bool { true }
}
```

**Correct: One required method, defaults handle the rest**

```rust
trait Logger {
    // Single required method -- the core abstraction
    fn log(&self, level: Level, msg: &str);

    // Defaults built on the required method
    fn debug(&self, msg: &str) { self.log(Level::Debug, msg); }
    fn info(&self, msg: &str)  { self.log(Level::Info, msg); }
    fn warn(&self, msg: &str)  { self.log(Level::Warn, msg); }
    fn error(&self, msg: &str) { self.log(Level::Error, msg); }
    fn enabled(&self) -> bool  { true }
}

#[derive(Debug, Clone, Copy)]
enum Level { Debug, Info, Warn, Error }

struct FileLogger;

// Implementor only provides the core method
impl Logger for FileLogger {
    fn log(&self, level: Level, msg: &str) {
        eprintln!("[{level:?}] {msg}");
    }
}
```

**When acceptable:**
- Every method is genuinely independent with no sensible default (e.g., `Read` and `Write` on an I/O trait)
- The trait is a marker trait with no methods at all
- Providing a default would hide important implementation decisions that each type must make explicitly
