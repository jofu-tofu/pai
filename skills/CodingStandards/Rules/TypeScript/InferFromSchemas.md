### 8.2 Infer Types From Schemas

**Impact: HIGH (Manually maintaining both a Zod schema and a TypeScript interface creates drift — derive the type from the schema)**

When you define a Zod schema AND a separate TypeScript interface, they will diverge. Someone adds a field to the interface but forgets the schema, or vice versa. Use `z.infer<typeof Schema>` to derive the type from the schema — single source of truth, zero drift.

**Incorrect: Parallel type and schema definitions**

```typescript
// These WILL drift apart over time
interface CreateOrderInput {
  productId: string;
  quantity: number;
  shippingAddress: string;
  couponCode?: string;
}

const CreateOrderSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  shippingAddress: z.string().min(10),
  // forgot couponCode — silent drift
});

function createOrder(input: CreateOrderInput) {
  const validated = CreateOrderSchema.parse(input);
  // validated is missing couponCode — type says it's there
}
```

**Correct: Schema is the source of truth**

```typescript
const CreateOrderSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  shippingAddress: z.string().min(10),
  couponCode: z.string().optional(),
});

// Type derived from schema — always in sync
type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

// For output types with transforms
const OrderResponseSchema = CreateOrderSchema.extend({
  id: z.string().uuid(),
  total: z.number(),
  createdAt: z.coerce.date(),
});

type OrderResponse = z.infer<typeof OrderResponseSchema>;
```

**When acceptable:**
- Types that are never validated at runtime (internal state, UI-only types) don't need schemas
- Third-party types you can't control — wrap with Zod at the boundary but keep the original type internally
