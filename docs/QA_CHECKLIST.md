# QA Checklist (Bugfix)

## Menu
- [ ] Desktop grid shows day column on the left and meal columns equal width.
- [ ] Long ingredient names truncate with ellipsis and show full name on hover/tap.
- [ ] New menu items use ingredient default quantity.
- [ ] Inline quantity edit rejects 0/empty and persists valid values.

## Ingredients
- [ ] Edit opens modal with prefilled values.
- [ ] Allowed Meals dropdown is not clipped inside modal.
- [ ] Category select shows defaults and accepts new category (editable).
- [ ] New category persists and appears in options after save.

## Shopping
- [ ] Add off-menu opens modal; submit adds item.
- [ ] Edit off-menu opens modal; update persists changes.

## Edge cases
- [ ] Very long ingredient name does not break layout (mobile + desktop).
- [ ] Quantity values: empty, 0, and large numbers handled without UI break.
- [ ] Modal dropdowns on 360x800 remain fully usable.
