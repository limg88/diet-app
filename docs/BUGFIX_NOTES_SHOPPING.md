# Bugfix Notes - Shopping

## Changes
- Off-menu add/edit moved into a modal dialog to match Ingredients UX.
- Added header action to open the off-menu modal.
- Edit action now opens the modal with prefilled values.

## Manual verification
1) Open Shopping page and click “Add off-menu”: modal opens with empty form.
2) Fill and submit: item appears in the list and toast shows success.
3) Click edit on an off-menu item: modal opens with prefilled values; update persists.
