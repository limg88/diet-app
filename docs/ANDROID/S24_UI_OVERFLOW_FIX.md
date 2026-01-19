# S24 UI Overflow Fix - Menu & Collaborator Menu

## Elements responsible (suspected)
- `.page-title-row` (title + p-tag) without wrapping caused horizontal overflow on narrow widths.
- PrimeNG accordion containers could exceed width due to internal padding/box model.
- `.items li` flex row could overflow without `min-width: 0`.

## Changes applied
- `frontend/src/app/pages/menu/menu-page.component.scss`
  - `.page-title-row` now wraps to prevent title + badge overflow.
  - `.page-header__meta` gets `min-width: 0` for flex truncation.
  - `.menu-mobile` constrained to `width: 100%` / `max-width: 100%`.
  - Added `width: 100%` + `box-sizing: border-box` for accordion containers.
  - Guardrail: `overflow-x: clip` on `.menu-mobile` for mobile widths to prevent stray horizontal scroll.
  - `.items li` gets `min-width: 0` to prevent flex overflow.

## Rationale
- Prevents content from exceeding viewport on S24 while keeping layout intact.
- Guardrail is scoped to `.menu-mobile` only and only below desktop breakpoint.

## Verification
- In mobile viewport, confirm `document.scrollingElement.scrollWidth === clientWidth`.
- Navigate to Menu and Collaborator Menu and verify no horizontal scroll.
