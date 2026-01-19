# S24 UI Bugs - Milestone 0 Findings

## Scope
- Target: Samsung S24 (Android WebView/Capacitor).
- Areas: Shell navigation (safe-area), Menu page, Collaborator Menu page.
- Status: code-level inspection only (no emulator run in this session).

## Repro Steps (expected on S24)
1) Open app on mobile viewport (Chrome DevTools 360x800 and 412x915).
2) Navigate to Menu and Collaborator Menu.
3) Observe:
   - bottom nav overlaps gesture area
   - horizontal scroll on Menu/Collaborator Menu
   - accordion background appears dark
   - ingredient row wraps onto multiple lines
   - long scroll with empty space (elastic/never-ending)

## Components and Routes
- Shell layout: `frontend/src/app/shell/shell.component.html`, `frontend/src/app/shell/shell.component.scss`.
- Menu: `frontend/src/app/pages/menu/menu-page.component.html`, `frontend/src/app/pages/menu/menu-page.component.scss`.
- Collaborator Menu wrapper: `frontend/src/app/pages/menu/collaborator-menu.component.html`.
- Collaborator Menu uses the same `app-menu-page` template and styles.

## Bug A - Safe-area overlap (bottom nav)
Evidence:
- Bottom nav is fixed: `.shell__nav { position: fixed; bottom: 0; height: var(--shell-nav-height); }`
- Content padding accounts for nav height + `env(safe-area-inset-bottom)`.
Candidate root causes:
- Android does not expose `env(safe-area-inset-bottom)` (value = 0), so no extra bottom padding for gesture area.
- `height` is fixed; `padding-bottom` inside nav cannot expand the area below for gestures.
- Content padding may be insufficient for Android gesture insets.

## Bug B - Menu page
### Horizontal scroll
Evidence (likely suspects from template/CSS):
- `page-title-row` uses `display: flex` without wrapping; long titles can overflow in narrow widths.
- `.items li` uses `display: flex` with `.item-controls` allowed to wrap on mobile.
- `.menu-mobile .item-qty { width: 100%; }` plus full-width `p-inputNumber` can push layout.
Candidate root causes:
- Long `title`/subtitle text and `p-tag` in a single row without wrapping.
- Flex items in `.items li` exceed container width due to fixed input widths and wrap logic.
- PrimeNG accordion panel/header styles may add horizontal padding or width beyond container.

### Accordion background too dark
Evidence:
- No local overrides in `menu-page.component.scss` for accordion header/content background.
Candidate root cause:
- Default PrimeNG theme for `.p-accordion-header` / `.p-accordion-content` uses darker surface, not matched to current light palette.

### Ingredient row split on multiple lines
Evidence:
- `.menu-mobile .item-controls` sets `flex-wrap: wrap` and `width: 100%` for `.item-qty`.
Candidate root cause:
- `flex-wrap: wrap` plus full-width input makes controls stack under the name, forcing multi-line layout.

### Infinite/elastic scroll
Evidence:
- No virtual scroll or infinite loading in `menu-page.component.html`.
- Menu data assigned directly (`this.menu = menu`), no array concat.
Candidate root causes:
- Layout height inflation from padding + fixed nav might create extra blank scroll.
- Accordion content height or repeated margin stacking could expand scroll height.
- Any overscroll behavior is likely CSS layout (not data) since no virtual scroll is present.

## Bug C - Collaborator Menu page
Evidence:
- Wrapper uses `app-menu-page` with `title` set to "Menu di {email}".
Candidate root causes:
- Longer title (email) in `.page-title-row` could worsen overflow-x.
- Same layout and accordion issues as Menu page (shared component).
- Infinite scroll likely same root cause as Menu.

## Notes for further verification
- Use DevTools to compare `document.scrollingElement.scrollWidth` vs `clientWidth`.
- Inspect `page-header` and `.menu-mobile` containers for overflow.
- Verify accordion header/content styles in computed CSS to confirm dark background source.

## Milestone 1 - Safe-area fix applied
Changes:
- Added safe-area CSS variables with Android fallback and applied to header, content padding, and bottom nav height/padding.
Files:
- `frontend/src/app/shell/shell.component.scss`

Expected impact:
- Bottom nav content sits above gesture area even when `env(safe-area-inset-bottom)` returns `0`.

## Milestone 3 - Accordion background fix applied
Changes:
- Scoped accordion header/content background to light surfaces on mobile menu view.
Files:
- `frontend/src/app/pages/menu/menu-page.component.scss`
