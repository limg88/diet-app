# Bug: Collab mobile layout overflow and menu disappears

## Steps to reproduce
1. Open the app and navigate to `/collaboration`.
2. In Chrome DevTools, enable a mobile viewport (e.g., 360x800, 390x844).
3. Observe horizontal overflow (side scroll) and that the bottom nav appears off-screen when the page is scrolled horizontally.

## Viewports tested
- 360x800
- 390x844
- 414x896

## Initial hypothesis
- The Collab page uses `display: flex` cards (`.invite-card`, `.partner-card`) with `justify-content: space-between` but no wrapping or text break rules.
- Long emails and fixed-size buttons can force the card wider than the viewport, creating horizontal overflow.
- The bottom nav is `position: fixed`; when the page overflows horizontally it looks like the nav "disappears" because the content scrolls sideways.

## Root cause confirmed
The `invite-card` and `partner-card` flex rows did not allow wrapping or text breaks, so long emails and button groups expanded the card beyond the viewport, causing horizontal overflow. This made the fixed bottom nav appear off-screen on mobile.

## Fix applied
- Enable wrapping on the card containers and allow text to break.
- Ensure the action group and buttons wrap to the next line on narrow screens.

## Verification steps
1. Open `/collaboration` on mobile viewports (360x800, 390x844, 414x896).
2. Confirm there is no horizontal scrolling.
3. Confirm the bottom nav is visible and tappable.

## Candidate files/components
- `frontend/src/app/pages/collaboration/collaboration.component.html`
- `frontend/src/app/pages/collaboration/collaboration.component.scss`
- `frontend/src/app/shell/shell.component.scss`
