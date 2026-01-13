# Shopping Warehouse UI Notes

## Behavior
- Warehouse is editable inline (desktop table + mobile cards).
- Empty/invalid input is treated as `0`.
- Negative values are clamped to `0` on save.
- Warehouse can exceed Quantity; **To Purchase** is computed as `max(Quantity - Warehouse, 0)`.

## Verification Steps
1. Open `/shopping` and ensure the **This week** table shows `Quantity | Warehouse | To Purchase`.
2. Edit **Warehouse** on a row and blur the input:
   - Value persists after reload.
   - **To Purchase** updates immediately.
3. Enter a negative value:
   - It normalizes to `0` on blur.
4. Enter a value greater than **Quantity**:
   - **To Purchase** shows `0` (no negative values).
