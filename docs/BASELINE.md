# Baseline

## Stack
- Frontend: Angular 20.3 + PrimeNG 20 (PrimeIcons 7), TypeScript 5.9
- Backend: NestJS 11, TypeScript 5.7, JWT auth (passport-jwt)
- Database: PostgreSQL 16 (docker-compose)
- Tooling: ESLint + Prettier, Jest (backend), Karma/Jasmine (frontend)

## Entrypoints
- Backend: `backend/src/main.ts` (global prefix `/api`)
- Frontend: `frontend/src/main.ts`

## Scripts (root)
- `npm run dev`: starts backend (Nest `start:dev`) + frontend (`ng serve` with proxy)
- `npm test`: backend e2e + frontend CI test
- `npm run lint`: lint backend + frontend
- `npm run format`: format backend + frontend

## Backend scripts (selected)
- `npm --prefix backend run start:dev`
- `npm --prefix backend run migration:run`
- `npm --prefix backend run seed:run`
- `npm --prefix backend run test:e2e`

## Frontend scripts (selected)
- `npm --prefix frontend run start`
- `npm --prefix frontend run test:ci`

## Environment variables (.env.example)
- `DATABASE_URL`
- `JWT_SECRET`
- `TZ` (Europe/Rome)
- `API_BASE_URL` (frontend)

## Feature map (from AGENTS.md + UI)
- Auth: register/login, JWT; per-user data
- Weekly menu: current ISO week (Europe/Rome), 7 days × 5 meals, add/remove meal items
- Ingredients database: CRUD, filters, allowed meal types
- Shopping list: aggregated from menu + off-menu items, purchased toggle

## Routes / pages
- `/login` (LoginComponent)
- `/menu` (MenuComponent)
- `/shopping` (ShoppingComponent)
- `/ingredients` (IngredientsComponent)
- Shell layout + auth guard on protected routes

## Critical components / modules
- Frontend: `core/auth/*`, `core/api/*`, `core/ui/toast.service.ts`, `shell/*`
- Backend: `auth`, `ingredients`, `menu`, `shopping`, `users`, `database`, `health`

## Tests inventory
- Backend e2e specs: `backend/test/*.e2e-spec.ts`
- Frontend unit tests: `ng test` / `test:ci`

## Baseline run verification (Milestone 0)
- Command: `npm --prefix backend run test:e2e -- --runTestsByPath test/app.e2e-spec.ts`
- Result: PASS (Health e2e) and migrations executed successfully

## Notes / deltas
- AGENTS-2.md requires Milestone 0 onboarding before bug-fixing; AGENTS.md says start from Milestone 1. Current work follows AGENTS-2.md per user request.
