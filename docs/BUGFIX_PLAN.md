# Bugfix Plan (Milestone 0)

## UI requirements summary
- Current week only (Europe/Rome), 7 days × 5 meals.
- Ingredients have name, optional category, defaultUnit, allowedMealTypes.
- Shopping list aggregates current menu + off-menu items and supports filters.
- UI is mobile-first with PrimeNG components and stable `data-cy` selectors.

## Reproduction notes
- Runtime reproduction not executed in this session; previous Docker build failed due to FE build errors/budgets.
- Bugs are mapped from provided prompt + code inspection. Manual steps below reflect expected UI flow.

| Bug | Page | Severity | Repro steps | Suspected cause | Files to touch | Fix strategy | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Day column not on the left | Menu | Medium | Open Menu desktop view; day labels appear after meal headers instead of first column. | Grid header lacks day column cell, causing misalignment. | `frontend/src/app/pages/menu/menu.component.html`, `frontend/src/app/pages/menu/menu.component.scss` | Add day column header cell and ensure grid template places day column first. | Validate on desktop >= 1024px. |
| Breakfast column narrower | Menu | Medium | Open Menu desktop view; breakfast column appears tighter than others. | Grid column definitions or header alignment create uneven widths. | `frontend/src/app/pages/menu/menu.component.scss` | Use `repeat(5, minmax(0, 1fr))` and align header + body columns uniformly. | Keep day column fixed width. |
| Ingredient names overflow | Menu | Medium | Add ingredient with long name; layout breaks or wraps excessively. | No truncation constraints on item labels. | `frontend/src/app/pages/menu/menu.component.html`, `frontend/src/app/pages/menu/menu.component.scss` | Add max-width + ellipsis; add `title` for full name on hover/tap. | Avoid breaking `data-cy`. |
| Editable grams with default quantity | Menu | High | Add ingredient; quantity defaults to ingredient default quantity; user edits per row. | No default quantity in data model; menu items rendered as static text. | FE + BE ingredients/menu modules | Add `defaultQuantity` to Ingredient entity + DTOs + migrations; set draft quantity on selection; add inline edit via `p-inputNumber` + PATCH item. | Validate quantity > 0. |
| Allowed Meals dropdown clipped | Ingredients | Medium | Open Add/Edit Ingredient; open Allowed Meals dropdown; it is clipped by modal. | Overlay appended inside dialog, overflow hidden. | `frontend/src/app/pages/ingredients/ingredients.component.html` | Use `appendTo="body"` for multiselect (or Prime overlay container). | Verify on mobile. |
| Category should be selectable + addable | Ingredients | High | Add Ingredient; category should be select with predefined options + add new category. | Category is free text; no category model. | FE + BE ingredients | Introduce category list from backend (distinct categories + defaults); use editable select or add-category UI; persist on save. | Decide on persistence approach. |
| Edit ingredient does not open modal | Ingredients | High | Click edit on ingredient card/table; modal does not open. | `startEdit` doesn't toggle modal. | `frontend/src/app/pages/ingredients/ingredients.component.ts` | Set `showForm = true` in `startEdit`. | Ensure form prefilled. |
| Off-menu add/edit must be modal | Shopping | Medium | On Shopping page, off-menu uses inline form; should open modal for add/edit. | Current UI uses inline form. | `frontend/src/app/pages/shopping/*` | Replace inline form with dialog; reuse form for add/edit; update buttons. | Keep data-cy stable. |
