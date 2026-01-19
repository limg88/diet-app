# S24 UI Infinite Scroll - Root Cause and Fix

## Root cause (likely)
- The layout uses `min-height: 100vh` in the shell with a fixed bottom nav and extra bottom padding.
- On Android, the dynamic browser UI can cause `100vh` to be taller than the visible viewport, creating extra blank scroll space and an "elastic" feeling.
- There is no virtual scroll or data duplication in the Menu components, so the issue is CSS/layout rather than infinite loading.

## Fix applied
- `frontend/src/app/shell/shell.component.scss`
  - Added `min-height: 100dvh` to align shell height with the dynamic viewport.
  - Added `overscroll-behavior-y: contain` on mobile content to prevent elastic scroll chaining.
- `frontend/src/app/pages/menu/menu-page.component.ts`
  - Added a dev-mode guardrail to warn if menu data grows unexpectedly (days/items count).

## How to verify
- On S24 viewport, scroll to bottom of Menu and Collaborator Menu.
- Confirm scroll stops at content end with no endless blank area.
- Confirm no console warnings unless menu size is unusually large.
