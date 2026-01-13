# UX Audit (Milestone 0)

## 1) App summary (from AGENTS + current UI)
Diet app to manage:
- Weekly Menu for current ISO week (Mon-Sun, Europe/Rome) with 5 meal types.
- Shopping list aggregated from the weekly menu plus off-menu items, with purchased flag.
- Ingredients database (CRUD) with filters and sorting.
- Auth: register/login with email+password; user-specific data.

Frontend is Angular with PrimeNG and a mobile-first layout. UI already includes toast service, filters, tables, cards, dialogs, and a responsive shell.

## 2) Page/route map and key flows
Routes (from `src/app/app.routes.ts`):
- `/login`: login/register form with validation errors.
- `/menu`: weekly menu page (mobile accordion, desktop grid).
- `/shopping`: shopping list page (filters, off-menu CRUD, purchased toggle).
- `/ingredients`: ingredients CRUD (filters, list, add/edit dialog).
- `**` redirects to `/menu`.

Primary flows:
- Auth: register/login -> access shell pages.
- Ingredients: filter list -> add -> edit -> delete (dialog on desktop + card on mobile).
- Menu: view current week -> add items to meal via select -> remove items -> save/refresh.
- Shopping: filter list -> add/edit off-menu -> toggle purchased -> delete off-menu.

Edge flows:
- Empty states: menu missing, empty lists for ingredients/shopping.
- Validation: required fields on ingredient/off-menu forms.

## 3) UI inventory
Component library:
- PrimeNG (p-card, p-table, p-select, p-multiSelect, p-dialog, p-accordion, p-toggleSwitch, p-inputNumber, p-password, p-button, p-tag, p-progressSpinner, p-divider).

Layout:
- App shell with sticky header on mobile and fixed bottom nav; desktop switches to left sidebar nav.
- Content area limited to 1200px width with padding.

Patterns:
- Forms: filter panels + inline create forms (shopping), dialog form (ingredients), login panel.
- Lists: cards on mobile, tables on desktop.
- Cards: general sections use `.card` and PrimeNG `p-card`.
- Feedback: spinners, minimal empty states, toast service exists in core.

## 4) Problems observed (UI/UX)
Visual hierarchy and spacing:
- Page-level hierarchy is inconsistent: headers are inside cards on some pages, while shell header hides on desktop, so top-level context can feel fragmented.
- Spacing is generally consistent, but filters and create forms stacked on shopping page create a tall first screen on mobile before the list appears.

Typography and styling:
- Uses Inter everywhere and default PrimeNG visuals; overall feel is clean but not distinctive or "accattivante".
- Primary vs secondary CTA emphasis varies across pages (e.g., Save uses success, other primary actions are info/secondary).

Navigation:
- Desktop removes top header entirely, leaving only side nav; no visible page title or context at the shell level on desktop.
- No breadcrumb or secondary navigation for complex screens.

Responsive behavior:
- Menu desktop grid at 1024px risks tight columns and dense content; no horizontal overflow handling.
- Ingredients dialog is fixed at 50vw which can be too narrow on mobile (50vw on 360px width is cramped).

States and feedback:
- Loading uses spinners only; no skeletons. Empty states are plain text with no guidance.
- Toasts exist but not consistently visible in UI guidelines; no global toast container shown in markup.

Accessibility:
- Some icon-only buttons lack aria-label (edit/delete actions on cards and tables).
- Focus ring exists globally, but icon-only buttons may not have visible focus styles if PrimeNG applies custom styling.

## 5) Technical constraints and theming
Theme/tokens:
- Global CSS variables defined in `src/styles.scss` (typography, spacing, colors).
- PrimeNG theme overrides in `src/assets/theme.scss` using CSS variables.

CSS approach:
- Component SCSS with BEM-ish class names and `:host ::ng-deep` for PrimeNG width fixes.
- Mobile/desktop switch uses `*ngIf` + CSS media queries.

Testing constraints:
- `data-cy` attributes exist across components for Cypress stability; avoid breaking selectors.
