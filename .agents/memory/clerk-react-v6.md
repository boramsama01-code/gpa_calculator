---
name: Clerk React v6 API
description: Key API differences in @clerk/react v6 for this project — avoids repeated debugging
---

**Rule:** In `@clerk/react` v6, use `Show` for conditional rendering, NOT `SignedIn`/`SignedOut`.

**Why:** `SignedIn`/`SignedOut` do not exist in v6. The exports are `Show` (with `when="signed-in"` or `when="signed-out"` prop), `ClerkLoaded`, `ClerkLoading`, etc.

**How to apply:** Always import `Show` from `@clerk/react`:
```tsx
import { Show } from "@clerk/react";
<Show when="signed-in">...</Show>
<Show when="signed-out">...</Show>
```

**Rule:** Use `publishableKeyFromHost` from `@clerk/react/internal` (not raw env var).

**Why:** Required for multi-domain Clerk support; Replit skill mandates this pattern.

**How to apply:**
```tsx
import { publishableKeyFromHost } from "@clerk/react/internal";
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
```

**Rule:** `proxyUrl = import.meta.env.VITE_CLERK_PROXY_URL` — empty in dev, auto-set in prod.

**Why:** Do NOT hardcode `/api/__clerk` or gate on NODE_ENV — breaks prod proxy.
