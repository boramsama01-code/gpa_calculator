# 내신 계산기 & 특목고 입시 컨설팅

중학생 학부모와 학생을 위한 내신 환산 점수 계산 및 특목고 입시 AI 컨설팅 도구

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (`artifacts/gpa-calculator`), Tailwind v4, shadcn/ui
- API: Express 5 (`artifacts/api-server`)
- DB: PostgreSQL + Drizzle ORM (`lib/db`)
- Auth: Clerk (Replit-managed, `@clerk/react` v6 + `@clerk/express`)
- AI: OpenAI GPT-4o (`OPENAI_API_KEY`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — DB tables (regional_policies, grades, activities, student_records, student_profiles)
- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth for API)
- `lib/api-client-react/` — generated React Query hooks (do not edit manually)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/gpa-calculator/src/pages/` — React page components (home, input, results, consulting, admin)
- `artifacts/gpa-calculator/src/App.tsx` — Clerk provider setup + routing

## Architecture decisions

- Cookie-based Clerk auth (web): do NOT add Bearer token or `setAuthTokenGetter` in frontend
- Clerk `Show` component (v6 API) used for auth-gated rendering — NOT `SignedIn`/`SignedOut`
- `publishableKeyFromHost` from `@clerk/react/internal` required for multi-domain support
- `proxyUrl = import.meta.env.VITE_CLERK_PROXY_URL` — empty in dev (intentional), auto-set in prod
- Google Fonts (`Pretendard`) loaded via HTML `<link>` tag — NOT via `@import url()` in CSS (PostCSS/Tailwind v4 requires `@import` to be first)

## Product

- 지역별 입시 정책 기반 내신 환산 점수 계산 (교과, 비교과, 출결, 세특)
- 과학고/영재학교, 외고/국제고, 자사고 목표 학교별 달성률 분석
- GPT-4o 기반 맞춤형 입시 전략 AI 컨설팅
- Clerk 로그인/회원가입 (이메일, Google OAuth)

## User preferences

- 모든 UI 텍스트는 한국어로 작성
- 이모지 사용 금지

## Gotchas

- Tailwind v4: `@import url()` for Google Fonts must NOT be in CSS; use `<link>` in `index.html` instead
- `@clerk/react` v6 exports `Show` (not `SignedIn`/`SignedOut`) for conditional rendering
- Dev: Clerk loads with `pk_test` keys — expected, not a bug
- Dev: `VITE_CLERK_PROXY_URL` is empty — expected, Clerk hits FAPI directly in dev
- CSS `@import` order in Tailwind v4: `@import "tailwindcss"` must be first (before any other `@import`)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
