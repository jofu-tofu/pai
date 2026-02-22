### RS9.5 ArenaForGraphStructures

**Impact: MEDIUM (Arenas eliminate reference-counting overhead and borrow checker friction for graph/tree structures)**

Graph and tree structures with shared or cyclic references are notoriously difficult to express with Rust's ownership model. The `Rc<RefCell<Node>>` pattern compiles but introduces runtime overhead (reference counting, borrow checking) and panics on borrow violations. Arena allocation with index-based references sidesteps these problems: all nodes live in a single allocation, references are plain indices, and the borrow checker works naturally because you borrow the arena, not individual nodes.

**Incorrect: Rc<RefCell<Node>> graph with runtime overhead and panic risk**

```rust
use std::cell::RefCell;
use std::rc::Rc;

type NodeRef = Rc<RefCell<Node>>;

struct Node {
    value: i32,
    children: Vec<NodeRef>,
}

fn sum_tree(node: &NodeRef) -> i32 {
    let borrowed = node.borrow(); // panics if already mutably borrowed
    let mut total = borrowed.value;
    for child in &borrowed.children {
        total += sum_tree(child);
    }
    total
}
```

**Correct: Arena with index-based references**

```rust
use slotmap::{SlotMap, new_key_type};

new_key_type! { struct NodeKey; }

struct Node {
    value: i32,
    children: Vec<NodeKey>,
}

struct Tree {
    nodes: SlotMap<NodeKey, Node>,
    root: NodeKey,
}

impl Tree {
    fn sum(&self, key: NodeKey) -> i32 {
        let node = &self.nodes[key];
        let child_keys: Vec<NodeKey> = node.children.clone();
        let mut total = node.value;
        for child_key in child_keys {
            total += self.sum(child_key);
        }
        total
    }

    fn add_child(&mut self, parent: NodeKey, value: i32) -> NodeKey {
        let child = self.nodes.insert(Node { value, children: vec![] });
        self.nodes[parent].children.push(child);
        child
    }
}
```

**When acceptable:**
- Simple trees with clear single ownership (parent owns children) where `Vec<Box<Node>>` works naturally
- Short-lived temporary structures where `Rc` overhead is negligible
- When interfacing with libraries that expect `Rc`-based APIs
- Prototyping where borrow checker friction slows iteration and correctness is verified later
