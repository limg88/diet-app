# Acceptance Criteria (high-level)

## Weekly Menu
- Shows ONLY current week (Mon-Sun) in Europe/Rome
- Has 5 meals per day
- Can add/edit/remove ingredients with quantity+unit
- Can add an ingredient only if allowed for that meal type
- On Monday, current week menu is created by copying previous week (if exists), else empty

## Shopping List
- Aggregates weekly menu ingredients
- Unique by (ingredientId, unit)
- Total quantity is sum of all occurrences in the week
- Has purchased toggle per item
- Off-menu items can be added/edited/removed and are marked as OFF_MENU
- Sort & filter by visible fields

## Ingredients Database
- CRUD ingredient
- Optional category, default unit, allowed meal types
- Sort & filter by fields
- Soft delete preferred

## UX/UI
- Mobile-first
- Toast on success/error/info
- Fast and usable on smartphone
