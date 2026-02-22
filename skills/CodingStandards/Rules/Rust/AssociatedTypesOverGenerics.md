### RS5.3 AssociatedTypesOverGenerics

**Impact: MEDIUM (Associated types clarify that a trait has one natural implementation per type, reducing annotation noise)**

When a trait has a type that is determined by the implementor and there is only one sensible choice per implementing type, use an associated type instead of a generic parameter. Generic parameters allow multiple implementations of the same trait for one type (`impl Trait<A> for X` and `impl Trait<B> for X`), which creates ambiguity and forces callers to use turbofish syntax. Associated types express the "one implementation per type" contract directly.

**Incorrect: Generic parameter where associated type belongs**

```rust
// Callers must always specify the output type
trait Graph<N, E> {
    fn edges(&self, node: &N) -> Vec<E>;
    fn nodes(&self) -> Vec<N>;
}

struct MyGraph;

// Could accidentally implement Graph<i32, i32> AND Graph<String, String>
impl Graph<i32, i32> for MyGraph {
    fn edges(&self, _node: &i32) -> Vec<i32> { vec![] }
    fn nodes(&self) -> Vec<i32> { vec![1, 2, 3] }
}

// Callers need turbofish everywhere
fn count_nodes<G: Graph<i32, i32>>(g: &G) -> usize {
    g.nodes().len()
}
```

**Correct: Associated types express one-to-one relationship**

```rust
trait Graph {
    type Node;
    type Edge;

    fn edges(&self, node: &Self::Node) -> Vec<Self::Edge>;
    fn nodes(&self) -> Vec<Self::Node>;
}

struct MyGraph;

impl Graph for MyGraph {
    type Node = i32;
    type Edge = i32;

    fn edges(&self, _node: &Self::Node) -> Vec<Self::Edge> { vec![] }
    fn nodes(&self) -> Vec<Self::Node> { vec![1, 2, 3] }
}

// Clean bounds, no turbofish needed
fn count_nodes<G: Graph>(g: &G) -> usize {
    g.nodes().len()
}
```

**When acceptable:**
- The trait genuinely needs multiple implementations per type (e.g., `From<T>` is generic because a type can convert from many sources)
- You want callers to select the type at the call site rather than at the impl site
- The trait is a mathematical operation where the operand type varies (e.g., `Add<Rhs>`)
