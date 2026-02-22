### SV2.9 Use Correct $env Module for Server vs Client

**Impact: HIGH (prevents secret leakage through incorrect env imports)**

Use `$env/static/private` for server-only secrets and `$env/static/public` for client-safe values. SvelteKit enforces this at build time — importing private env in client code is a build error.

**Incorrect: using public env for secrets**

```typescript
// +page.svelte — client code!
import { DATABASE_URL } from '$env/static/public'; // Exposes secret!
```

**Correct: private env in server files only**

```typescript
// +page.server.ts — server only
import { DATABASE_URL, API_SECRET } from '$env/static/private';

// +page.svelte — client-safe public env only
import { PUBLIC_APP_NAME } from '$env/static/public';
```

**The rule:** If the value is a secret (database URL, API key, signing key), it MUST come from `$env/static/private` and only be imported in `.server.ts` files, `hooks.server.ts`, or server-side load functions.
