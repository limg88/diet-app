# UI/UX Improvements

## Issues found
- Forms lacked inline validation feedback, making it unclear why submits failed.
- Shopping and ingredients card actions could overflow on small screens.
- Menu table on mobile had no hint for horizontal scrolling.
- Focus visibility relied on defaults, which were inconsistent across PrimeNG components.

## Changes implemented
- Added field-level validation messages for login, ingredients, and off-menu forms.
- Added `data-cy`-neutral UI layout tweaks: wrapped form fields for consistent spacing and alignment.
- Added a mobile-only horizontal scroll hint for the weekly menu table.
- Improved focus visibility for buttons/links/inputs/selects via a shared focus ring.
- Adjusted card action layout to wrap and align on narrow screens.
- Centered main content and constrained bottom nav width for desktop comfort.

## Spacing/typography rules
- Keep forms to a grid with 0.75rem gaps, field errors at 0.75rem text size.
- Use card padding at 1rem and consistent 0.75rem gaps in list cards.

## Accessibility tweaks
- Added aria-labels to icon-only actions where needed.
- Ensured focus ring is visible across PrimeNG inputs/selects.

## Files updated
- `frontend/src/styles.scss`
- `frontend/src/app/shell/shell.component.scss`
- `frontend/src/app/shell/shell.component.html`
- `frontend/src/app/pages/login/login.component.html`
- `frontend/src/app/pages/ingredients/ingredients.component.html`
- `frontend/src/app/pages/ingredients/ingredients.component.scss`
- `frontend/src/app/pages/shopping/shopping.component.html`
- `frontend/src/app/pages/shopping/shopping.component.scss`
- `frontend/src/app/pages/menu/menu.component.html`
- `frontend/src/app/pages/menu/menu.component.scss`

## Latest UI refactors (Milestone 3)
- Added shared empty/error state patterns with icons and retry actions.
- Added labels and helper hints to filters and off-menu/ingredient forms.
- Improved dialog responsiveness and spacing for ingredient create/edit.
- Added aria-labels to icon-only actions and toggles.
- Added subtle hover elevation for list cards and menu items.

## Additional files updated in Milestone 3
- `frontend/src/app/pages/menu/menu.component.ts`
- `frontend/src/app/pages/shopping/shopping.component.ts`
- `frontend/src/app/pages/ingredients/ingredients.component.ts`
