---
name: Tailwind v4 CSS import order
description: Google Fonts and @import url() constraints with Tailwind v4 / PostCSS
---

**Rule:** Do NOT use `@import url('https://fonts.googleapis.com/...')` inside CSS files when using Tailwind v4.

**Why:** PostCSS/Tailwind v4 requires all `@import` rules to precede other statements. `@import "tailwindcss"` expands to many rules, so any `@import url()` after it causes: `@import must precede all other statements`. Even putting it before `@import "tailwindcss"` is fragile because Vite may reorder during HMR.

**How to apply:** Load Google Fonts via `<link>` tag in `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Rule:** In Tailwind v4 CSS, `@import "tailwindcss"` must be the first `@import`.
