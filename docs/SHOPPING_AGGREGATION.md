# Shopping Aggregation (Collaborators)

## Scope
The Shopping List now aggregates menu items from:
- the current user
- all active collaborators (accepted invites)

Off-menu items remain **user-owned** (current user only).

## Rules
- Aggregation key: `(normalized name, unit)` where name is lowercased + trimmed
- Total quantity = sum across all menus for the current week
- `warehouse` remains a single value per aggregated item (current user)
- `toPurchase = max(totalQuantity - warehouse, 0)`

## UI
- Hovering the ingredient name shows a breakdown of quantities per owner (You + collaborator email).
- Off-menu items from collaborators are visible but not editable by other users.

## Notes
- Collaborator menus are ensured for the current week before aggregation.
- If a collaborator has no items, their menu contributes nothing.
