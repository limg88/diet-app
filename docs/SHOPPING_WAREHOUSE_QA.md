# Shopping Warehouse QA Checklist

## Edge Cases
- Warehouse input empty -> stored as `0`.
- Warehouse negative -> normalized to `0`.
- Warehouse greater than Quantity -> allowed, To Purchase shows `0`.
- Quantity missing/0 -> To Purchase shows `0`.

## Persistence
- Set Warehouse to a non-zero value.
- Reload `/shopping`.
- Warehouse value remains unchanged.

## Cypress
- `cypress/e2e/shopping.cy.ts` covers: edit warehouse -> To Purchase updates -> reload persists.
