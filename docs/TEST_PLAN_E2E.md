# Cypress E2E Test Plan

## Scope
Cover all AGENTS.md use cases and key UI flows:
- Auth (register/login)
- Ingredients CRUD + filters
- Weekly menu (current week, add item, invalid meal type rejected)
- Shopping list aggregation + off-menu + purchased toggle + filtering

## Test data strategy
- Each spec creates a unique user via API (timestamp-based email).
- Data setup uses API requests to reduce flakiness and speed up setup.
- UI flows are exercised for the user-facing actions in each use case.

## Selectors strategy
- Use stable `data-cy` attributes for form inputs, actions, nav, and list cards.
- Avoid brittle CSS selectors and visible-only text when possible.

## Auth handling
- Custom Cypress command `registerAndLogin` creates a user and sets `dietapp_token` in localStorage.
- For tests requiring direct API setup, login is performed with `cy.request` and the token is used in API calls.

## Specs mapping

| Use case | Spec | Coverage |
| --- | --- | --- |
| Register + login | `cypress/e2e/auth.cy.ts` | UI register + login flow |
| Ingredients list + create + update + delete | `cypress/e2e/ingredients.cy.ts` | UI CRUD + filter by category |
| Menu current week + add item | `cypress/e2e/menu.cy.ts` | UI add item to lunch |
| Menu rejects invalid meal type | `cypress/e2e/menu.cy.ts` | UI add breakfast-only ingredient to lunch (expect error) |
| Shopping aggregation | `cypress/e2e/shopping.cy.ts` | Menu items aggregated (200+50 ml) |
| Shopping off-menu CRUD | `cypress/e2e/shopping.cy.ts` | UI add off-menu item |
| Shopping purchased toggle | `cypress/e2e/shopping.cy.ts` | Toggle purchased state |
| Shopping filtering | `cypress/e2e/shopping.cy.ts` | Filter by source |

## Running
- Start DB + backend + frontend first.
- Run Cypress headless:
  - `npm run e2e`
- Optional GUI:
  - `npm run e2e:open`

## Assumptions
- Backend is available at `http://localhost:3000/api`.
- Frontend is available at `http://localhost:4200`.
- Default unit options and meal types are unchanged.
