# Collaborator Menu

## Route
- `/collaborators/:collaboratorId/menu`

## Implementation
- Extracted `MenuPageComponent` to reuse the Menu UI and logic.
- `MenuComponent` (own menu) is now a thin wrapper.
- Collaborator menu uses `MenuPageComponent` with `ownerUserId`.

## UI Details
- Title: `Menu di <email>`
- Badge: `Collaborator`

## Notes
- Menu actions (add/update/remove) pass `ownerUserId` to the API.
- Ingredients list is fetched using `ownerUserId` for collaborators.
