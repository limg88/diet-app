# Menu Multi-Owner Access

## Goal
Allow accessing the current-week menu for:
- the authenticated user
- an active collaborator (bidirectional)

## API Changes
Menu endpoints accept optional `ownerUserId` query param:
- `GET /api/menu/current?ownerUserId=...`
- `POST /api/menu/current/meals/:mealId/items?ownerUserId=...`
- `PUT /api/menu/current/items/:itemId?ownerUserId=...`
- `DELETE /api/menu/current/items/:itemId?ownerUserId=...`

## Authorization
- If `ownerUserId` is omitted or equals the current user: allowed.
- If `ownerUserId` differs: allowed only if an accepted collaboration exists.
- Otherwise: `403 Not allowed to access this menu`.

## Data Ownership
Queries are scoped to `weekly_menus.user_id = ownerUserId`.
Ingredient validation also uses `ownerUserId` to ensure ingredients belong to the menu owner.
