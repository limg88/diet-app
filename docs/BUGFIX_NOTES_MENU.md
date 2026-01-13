# Bugfix Notes - Menu

## Changes
- Added day header column on desktop grid and aligned column widths for all meals.
- Truncated long ingredient names with ellipsis and added tooltip via `title`.
- Added inline quantity edit per menu item with validation (> 0).
- Default quantity now comes from ingredient `defaultQuantity`, used when adding items.

## Manual verification
1) Open `/menu` on desktop (>= 1024px): day column is the first column and meal columns have equal width.
2) Add an ingredient with a long name: the name is truncated and full name appears on hover/tap.
3) Add a menu item: quantity defaults to ingredient `defaultQuantity`.
4) Edit quantity inline: setting a value > 0 persists; setting 0 or empty shows an error and reverts.
