### 6.1 Branded Types for Validated Data

**Impact: MEDIUM (Prevents mixing semantically different values that share the same primitive type — UserId vs OrderId are both strings but not interchangeable)**

TypeScript is structurally typed — two `string` types are interchangeable even when they represent different domains. Branded types add a phantom property that makes them nominally distinct, so the compiler prevents you from passing a `UserId` where an `OrderId` is expected.

**Incorrect: Primitive types allow semantic misuse**

```typescript
function getUser(id: string): User { /* ... */ }
function getOrder(id: string): Order { /* ... */ }

const userId = "usr_123";
const orderId = "ord_456";

// No error — both are string, but this is a bug
getUser(orderId);
getOrder(userId);
```

**Correct: Branded types enforce domain boundaries**

```typescript
type Brand<T, B extends string> = T & { readonly __brand: B };

type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

// Creation functions validate and brand
function UserId(id: string): UserId {
  if (!id.startsWith("usr_")) throw new Error(`Invalid user ID: ${id}`);
  return id as UserId;
}

function OrderId(id: string): OrderId {
  if (!id.startsWith("ord_")) throw new Error(`Invalid order ID: ${id}`);
  return id as OrderId;
}

function getUser(id: UserId): User { /* ... */ }
function getOrder(id: OrderId): Order { /* ... */ }

const userId = UserId("usr_123");
const orderId = OrderId("ord_456");

getUser(orderId);  // compile error — OrderId is not assignable to UserId
getUser(userId);   // works
```

**When acceptable:**
- Internal utility code where the overhead of branding isn't worth the safety
- Types already distinguished by structure (interfaces with different properties don't need branding)
- Prototyping — add brands when the domain model stabilizes
