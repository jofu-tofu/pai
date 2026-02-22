### TS4.2 Import Ordering

**Impact: MEDIUM (Consistent import order reduces merge conflicts and makes dependency relationships immediately visible)**

Imports should be grouped by origin and sorted within each group. This makes it obvious where dependencies come from (built-in vs external vs internal) and reduces merge conflicts when multiple developers add imports.

**Incorrect: Random import order**

```typescript
import { render } from "./utils/render";
import type { User } from "./types";
import { z } from "zod";
import path from "node:path";
import { useState } from "react";
import { db } from "../database";
import { formatDate } from "./utils/date";
import type { ApiResponse } from "../../shared/types";
```

**Correct: Grouped by origin with blank line separators**

```typescript
// 1. Built-in Node.js modules
import path from "node:path";

// 2. External packages
import { useState } from "react";
import { z } from "zod";

// 3. Internal — parent/shared modules
import type { ApiResponse } from "../../shared/types";
import { db } from "../database";

// 4. Internal — sibling/local modules
import type { User } from "./types";
import { formatDate } from "./utils/date";
import { render } from "./utils/render";
```

**Group order:** `built-in` → `external` → `internal (parent)` → `internal (sibling)` → `type-only`

Alphabetize within each group. Enforce with ESLint `import/order` or `@trivago/prettier-plugin-sort-imports`.

**When acceptable:**
- Side-effect imports (`import "./polyfills"`) go at the top regardless of origin
- CSS/asset imports follow framework conventions (e.g., CSS modules at the bottom in React components)
