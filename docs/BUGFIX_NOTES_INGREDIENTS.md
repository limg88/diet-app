# Bugfix Notes - Ingredients

## Changes
- Added category options list with editable select and persisted via ingredient records.
- Added categories endpoint to list distinct categories for the user.
- Modal edit now opens on edit click with prefilled values.
- Allowed Meals dropdown now uses `appendTo="body"` to avoid clipping.
- Added `defaultQuantity` field to ingredients to drive menu defaults.

## Manual verification
1) Open Ingredients and click edit: modal opens with prefilled fields.
2) In modal, open Allowed Meals dropdown: the panel is not clipped.
3) Category field shows predefined options and allows typing a new category.
4) Save new category, reopen modal: new category appears in the list.
