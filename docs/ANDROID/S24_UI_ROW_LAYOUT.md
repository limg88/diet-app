# S24 UI Ingredient Row Layout

## Target
Keep ingredient row on a single line in Menu and Collaborator Menu (mobile view).

## Changes
- `frontend/src/app/pages/menu/menu-page.component.scss`
  - Disabled wrapping on `.menu-mobile .item-controls`.
  - Kept quantity input width fixed (90px) to avoid pushing controls to a new line.
  - Restored inline layout for quantity + unit + remove button.

## Verification
- Use long ingredient names and confirm ellipsis on the name.
- Ensure quantity input and remove button stay on the same line.
