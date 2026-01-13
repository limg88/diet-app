# Collaboration QA

## E2E Coverage (Cypress)
- Invite -> accept -> collaborator appears (`cypress/e2e/collaboration.cy.ts`)
- Open collaborator menu, add item, update quantity, reload persists
- Shopping list includes collaborator menu totals

## Manual Checklist
1. Create invite by email.
2. Accept invite on recipient account.
3. Open collaborator menu and add/remove items.
4. Verify shopping list aggregates both menus.
