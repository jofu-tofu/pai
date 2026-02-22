### RS5.2 TypestatePattern

**Impact: MEDIUM (Encodes state machines in the type system so invalid transitions are compile errors)**

The typestate pattern uses generic type parameters to represent the current state of an object. Transitions between states consume the old value and return a new value with a different type parameter, making it impossible to call methods that are invalid for the current state. The state types are zero-sized, so the pattern has no runtime cost.

**Incorrect: Runtime state checks that can be forgotten**

```rust
struct Connection {
    addr: String,
    connected: bool,
}

impl Connection {
    fn send(&self, data: &[u8]) -> Result<(), String> {
        if !self.connected {
            return Err("Not connected".into()); // runtime check, easy to forget
        }
        println!("Sending {} bytes to {}", data.len(), self.addr);
        Ok(())
    }

    fn connect(&mut self) {
        self.connected = true;
    }
}

fn main() {
    let conn = Connection { addr: "10.0.0.1".into(), connected: false };
    // Compiles fine, fails at runtime
    let _ = conn.send(b"hello");
}
```

**Correct: Typestate makes invalid transitions a compile error**

```rust
use std::marker::PhantomData;

struct Disconnected;
struct Connected;

struct Connection<State> {
    addr: String,
    _state: PhantomData<State>,
}

impl Connection<Disconnected> {
    fn new(addr: &str) -> Self {
        Connection { addr: addr.into(), _state: PhantomData }
    }

    fn connect(self) -> Connection<Connected> {
        println!("Connecting to {}", self.addr);
        Connection { addr: self.addr, _state: PhantomData }
    }
}

impl Connection<Connected> {
    fn send(&self, data: &[u8]) {
        println!("Sending {} bytes to {}", data.len(), self.addr);
    }

    fn disconnect(self) -> Connection<Disconnected> {
        Connection { addr: self.addr, _state: PhantomData }
    }
}

fn main() {
    let conn = Connection::new("10.0.0.1");
    // conn.send(b"hello"); // compile error: no method `send` on Connection<Disconnected>
    let conn = conn.connect();
    conn.send(b"hello"); // OK -- type proves we are connected
}
```

**When acceptable:**
- Simple objects with only two states where a boolean flag is clear enough
- Prototyping where the state machine is still being discovered and refactored frequently
- When the number of states is large and combinatorial, making typestate types unwieldy
