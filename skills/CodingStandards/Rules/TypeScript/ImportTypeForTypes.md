### TS4.1 Import Type for Type-Only Imports

**Impact: MEDIUM (Type-only imports are erased at compile time — prevents importing runtime modules just for their types, reducing bundle size)**

When you import a type from a module, `import type` tells the compiler and bundler that this import is types-only and should be completely erased in the output. Without it, the bundler may include the entire module just for a type reference, bloating the bundle.

**Incorrect: Regular imports pull in runtime code for types**

```typescript
// Imports the entire module — even though we only use the type
import { UserService } from "./services/user-service";
import { DatabaseConnection } from "./database";

function createHandler(db: DatabaseConnection): void {
  // DatabaseConnection is only used as a type here
  // but the import pulls in the entire database module
}

// Mixing runtime and type imports without distinction
import { z } from "zod";
import { User, Order, ApiResponse } from "./types";
```

**Correct: Separate type imports from value imports**

```typescript
// Type-only import — erased at compile time, zero bundle impact
import type { DatabaseConnection } from "./database";
import type { UserService } from "./services/user-service";

function createHandler(db: DatabaseConnection): void {
  // Same type safety, no runtime import
}

// When you need both values and types from a module
import { z } from "zod";
import type { ZodSchema, ZodError } from "zod";

// Enable in tsconfig for enforcement
// "verbatimModuleSyntax": true
```

**When acceptable:**
- When the module is already imported for runtime values — adding a separate `import type` for its types is unnecessary noise
- Barrel files (`index.ts`) that re-export both types and values — use `export type` for type re-exports
