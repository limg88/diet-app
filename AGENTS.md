# DIET APP — Codex Implementation Plan (Angular + PrimeNG, NestJS, Postgres)

## 0) Mission
Build a production-quality, mobile-first Web app (with future APK path) for managing:
- Weekly Menu (current week only, Mon→Sun, Europe/Rome)
- Shopping List (aggregated weekly ingredients + off-menu items + purchased flag)
- Ingredients Database (CRUD + filters + sorting)

Tech:
- Frontend: Angular + PrimeNG (mobile-first)
- Backend: NestJS
- DB: PostgreSQL
Quality:
- Clean code, SOLID, consistent architecture
- Automated tests (minimum but mandatory)
- Toast notifications for user events (success/error/info)

IMPORTANT: Implement only what is described. Do not invent extra features (nutrition macros, calories, barcode scan, etc.).

---

## 1) Domain Rules (NON NEGOTIABLE)
### 1.1 Time & week definition
- Timezone: Europe/Rome
- "Current week" is ISO week starting on Monday and ending on Sunday.
- UI must show ONLY current week menu and current week shopping list.

### 1.2 Meals
Fixed meal types:
- BREAKFAST
- MORNING_SNACK
- LUNCH
- AFTERNOON_SNACK
- DINNER

Each day has all 5 meals (even if empty).

### 1.3 Ingredient unit
Allowed unit choices:
- gr
- ml
- unit

### 1.4 Adding ingredient constraints
An ingredient can be added to a meal ONLY IF that ingredient allows that meal type.
If ingredient.allowedMealTypes is empty or null, interpret as "allowed for ALL meals".

### 1.5 Weekly menu rollover
Every Monday, the weekly menu is "shifted" forward by copying the entire previous week menu to the new current week.
- Historical weeks MUST remain immutable (do not overwrite past weeks).
- Copy logic runs server-side.
- If current week menu does not exist, create it:
  - If previous week exists, copy it
  - Else create empty menu for all days/meals

### 1.6 Shopping list rules
- Shopping list shows ALL ingredients present in current week menu:
  - columns: name, totalQuantity, unit, category, mealType (or "MULTI" if appears in multiple meals), source=MENU
- Ingredients must be unique by (ingredientId, unit). Total is the sum across the week.
- Each shopping item has purchased flag (true/false).
- User can add/remove/modify additional items "off-menu":
  - source=OFF_MENU
  - off-menu can have ingredientId null, but must have name, quantity, unit
- Shopping list must be sortable and filterable by all displayed fields.

### 1.7 Ingredients database
- list all ingredients
- fields: name, category (optional), defaultUnit (gr|ml|unit), allowedMealTypes (multi-select)
- CRUD with soft-delete (deletedAt nullable) OR hard delete (choose one; prefer soft-delete).
- list is sortable and filterable by name/category/unit/allowedMealTypes/deleted.

---

## 2) Security & Auth (minimal but real)
- Implement user auth with email+password:
  - register, login
  - JWT access token
- Each user has their own menu/shopping/ingredients data (ingredients can be per-user for simplicity).

---

## 3) Deliverables (MILESTONES)
Work strictly milestone-by-milestone. Do not proceed to next milestone until DoD passes.

### Milestone 1 — Scaffold + Docker + CI Local
**Goal:** Repo runnable with one command.
Deliver:
- Angular app (PrimeNG configured)
- NestJS API
- Postgres via docker-compose
- workspace scripts (root package.json) to run FE/BE and tests
- lint+format configured
- README with setup commands

DoD:
- `docker compose up -d db` works
- `npm run dev` (or equivalent) starts FE + BE
- Health endpoint `GET /api/health` returns 200
- One minimal e2e test for health passes

### Milestone 2 — Ingredients CRUD + Filters/Sort + Tests
Deliver:
- DB migrations for ingredients + users
- endpoints CRUD + list with filter/sort/pagination
- validations (DTO)
- e2e tests: list+create+update+delete/soft-delete

DoD:
- `npm test` passes
- `GET /api/ingredients?search=&category=&unit=&mealType=&sort=` works

### Milestone 3 — Weekly Menu (current week only) + Copy-on-Monday
Deliver:
- schema for menu (weeklyMenus, menuMeals, mealItems)
- server-side week calculation Europe/Rome
- endpoint to get current menu (ensuring it exists and copy rules apply)
- endpoints to edit meal items (add/update/remove) enforcing allowedMealTypes
- e2e tests: create menu, add ingredient, reject invalid meal type

DoD:
- menu always returns 7 days × 5 meals
- invalid add returns 400 with meaningful message

### Milestone 4 — Shopping List Aggregation + Off-menu + Purchased
Deliver:
- shopping_items table (persist purchased + off-menu)
- endpoint to compute aggregated list from menu + merge persisted purchased
- CRUD off-menu
- sorting/filtering
- e2e tests: aggregation sums correctly; purchased persists

DoD:
- totals correct by (ingredientId, unit)
- purchased flag stable across reloads

### Milestone 5 — Frontend UI (mobile-first) + Toasts
Deliver:
- 3 pages: Weekly Menu, Shopping, Ingredients DB
- PrimeNG mobile-first layout (cards, bottom nav)
- Toast feedback for CRUD & errors
- basic loading/empty states
- FE unit tests minimal OR e2e smoke (prefer 1 e2e smoke)

DoD:
- user can login, manage ingredients, edit menu, see shopping aggregation, toggle purchased, manage off-menu

---

## 4) Engineering constraints
- TypeScript strict mode
- No duplicated business logic FE/BE: core rules are in BE
- Consistent error format from BE
- Use meaningful naming, SOLID services, small controllers
- Avoid unnecessary libraries

---

## 5) API & DB reference
See:
- docs/domain.md
- docs/api.md
- docs/decisions.md
- docs/acceptance.md

---

## 6) Execution instructions for Codex (IMPORTANT)
You MUST:
1) Start with Milestone 1 only.
2) After implementing, run commands locally (provide commands and expected output).
3) If something fails, fix it before moving on.
4) Update README continuously.
5) Keep commits logically grouped per milestone.

STOP after finishing Milestone 1 and report:
- what was created
- commands to run
- any assumptions
- next milestone plan
