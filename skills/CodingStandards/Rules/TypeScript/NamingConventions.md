### 10.1 Naming Conventions

**Impact: MEDIUM (Consistent naming communicates intent — readers know what something is before reading its definition)**

TypeScript has ecosystem conventions that encode meaning in casing. Following them makes code readable to any TypeScript developer without needing to look up definitions.

**Incorrect: Inconsistent or misleading naming**

```typescript
// Interface with I-prefix — C# convention, not TypeScript
interface IUserService { }

// Type with T-prefix — unnecessary in TypeScript
type TUserProps = { name: string };

// Boolean without predicate prefix
const active = true;      // active what? Is it a noun or adjective?
const loading = false;     // is this a verb or state?

// Constants in SCREAMING_CASE for non-environment values
const MAX_RETRY_COUNT = 3;
const DEFAULT_PAGE_SIZE = 20;

// Acronyms fully capitalized in multi-word names
function parseHTMLDocument() { }
type XMLHTTPRequest = {};
```

**Correct: TypeScript ecosystem conventions**

```typescript
// No I-prefix on interfaces — TypeScript uses structural typing
interface UserService { }

// No T-prefix on types
type UserProps = { name: string };

// Booleans as predicates — reads like a question
const isActive = true;
const hasPermission = false;
const shouldRetry = true;

// Prefer as const or enum-like objects for named constants
const config = {
  maxRetryCount: 3,
  defaultPageSize: 20,
} as const;

// Acronyms: only first letter capitalized in multi-word names
function parseHtmlDocument() { }
type XmlHttpRequest = {};

// General conventions:
// PascalCase: types, interfaces, classes, enums, components
// camelCase: variables, functions, methods, properties
// UPPER_SNAKE: environment variables only (process.env.DATABASE_URL)
```

**When acceptable:**
- `UPPER_SNAKE_CASE` for environment variable references and true compile-time constants
- Team conventions that differ — consistency within a project matters more than matching ecosystem conventions
