# Shopping Warehouse Design

## Scope
Add a per-item `warehouse` value to the **Shopping List → This week** table, and compute `toPurchase = max(quantity - warehouse, 0)` in UI.

## Files / Components Involved
- Backend:
  - `backend/migrations/003_shopping.sql` (schema)
  - `backend/src/shopping/shopping.service.ts` (load/update items)
  - `backend/src/shopping/shopping.controller.ts` (new endpoint)
  - `backend/src/shopping/dto/*` (new DTO)
  - `backend/src/database/seed.ts` (seed data)
- Frontend:
  - `frontend/src/app/core/api/api.types.ts` (model)
  - `frontend/src/app/core/api/shopping.api.ts` (API calls)
  - `frontend/src/app/pages/shopping/shopping.component.ts` (state + edit)
  - `frontend/src/app/pages/shopping/shopping.component.html` (table + cards)
  - `frontend/src/app/pages/shopping/shopping.component.scss` (layout tweaks)

## Model + Persistence Decision
**Decision:** Store `warehouse` as a numeric column on `shopping_items`.

**Why:** The “This week” list is week-scoped and already persisted in `shopping_items` (purchased/off-menu). Adding `warehouse` there keeps week-specific state alongside other per-item flags without introducing a global stock system.

## UI ↔ Model ↔ Persistence Mapping
- UI column **Warehouse** (editable number) maps to `shopping_items.warehouse`.
- UI column **To Purchase** (readonly) is computed in FE as `max(totalQuantity - warehouse, 0)`.
- Updates flow:
  - FE sends `PATCH /shopping/current/items/:id/warehouse` with `warehouse` number.
  - BE validates `warehouse >= 0`, persists to `shopping_items`, returns updated item.

## Retro-compatibility
- New column has `DEFAULT 0`, so existing rows read as `warehouse = 0`.
- Sync logic for MENU items keeps existing `warehouse` values intact.
