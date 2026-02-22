### TS4.4 File Organization

**Impact: MEDIUM (Co-locating types with implementation reduces navigation and keeps related code together)**

Types should live close to the code that uses them. A single `types.ts` file that holds every type in the project becomes a merge-conflict magnet and forces readers to jump between files. Co-locate types with their implementation; extract shared types to domain-specific files.

**Incorrect: Monolithic types file**

```typescript
// types.ts — 500+ lines, everything dumped here
export interface User { /* ... */ }
export interface Order { /* ... */ }
export interface Product { /* ... */ }
export interface CartItem { /* ... */ }
export interface ShippingAddress { /* ... */ }
export interface PaymentMethod { /* ... */ }
// Every change touches this file — merge conflict city
```

**Correct: Co-locate types with implementation**

```
src/
├── users/
│   ├── user.ts           # User type + user-related types
│   ├── user-service.ts   # imports User from ./user
│   └── user-api.ts       # imports User from ./user
├── orders/
│   ├── order.ts          # Order, OrderItem, OrderStatus types
│   ├── order-service.ts
│   └── order-api.ts
└── shared/
    └── api-types.ts      # Only truly cross-domain types (ApiResponse, Pagination)
```

```typescript
// users/user.ts — types co-located with their domain
export interface User {
  id: string;
  name: string;
  email: string;
}

export type CreateUserInput = Omit<User, "id">;
export type UserSummary = Pick<User, "id" | "name">;

// users/user-service.ts
import type { User, CreateUserInput } from "./user";
```

**When acceptable:**
- Small projects (< 10 files) where a single `types.ts` is genuinely simpler
- Generated types (from OpenAPI, GraphQL codegen) that live in a generated output directory
- Shared DTOs for API contracts between frontend and backend in a monorepo
