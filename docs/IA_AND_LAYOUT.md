# Information Architecture & Layout

This document outlines the information architecture and layout refinements applied to make the UI clearer, more premium, and consistently responsive across mobile and desktop.

## 1. Proposed Layout and Rationale

### Current Layout Observations

- Shell already exists: mobile uses bottom navigation and desktop uses a left sidebar. The shell is solid, but page-level headers were inconsistent.
- Page context missing on desktop: with the shell header hidden on desktop, pages lacked a consistent title/action zone.
- First screen density: Shopping and Ingredients started with filters, pushing primary context down on mobile.

### Proposed Layout

We use a responsive shell and add a consistent page header on every route.

Mobile (up to 768px):
- Layout: single column content.
- Navigation: bottom navigation bar for Menu, Shopping, Ingredients.
- Header: page-level header card with title and short context; primary action is included when needed.

Desktop (above 768px):
- Layout: sidebar navigation plus content area.
- Navigation: vertical sidebar with icons and labels.
- Header: page header sits at the top of each page, aligned with content and actions.
- Content: main area has a max width to avoid over-stretched layouts.

## 2. Route to Layout Mapping

Routes are unchanged. The ShellComponent renders the nav layout, while each page renders its own header.

- /menu:
  - Mobile: bottom nav, page header, accordion by day.
  - Desktop: sidebar nav, page header, weekly grid with meal columns.
- /shopping:
  - Mobile: bottom nav, page header, filters panel, card list view.
  - Desktop: sidebar nav, page header, filters plus table view.
- /ingredients:
  - Mobile: bottom nav, page header with Add Ingredient, filters panel, cards.
  - Desktop: sidebar nav, page header with Add Ingredient, filters plus table view.

## 3. Responsive Patterns

- Breakpoints: 768px switches between mobile and desktop layouts.
- Stacking: multi-column layouts stack vertically on small screens.
- Page headers: consistent page-header block for title and actions on all routes.
- Modals: near full-screen on mobile, centered on desktop.
- Tables: table view on desktop, card view on mobile to avoid horizontal scroll.

## 4. First Meaningful Screen Improvements

- Menu: page header with week context and actions, content immediately below.
- Shopping: page header introduces purpose before filters and list.
- Ingredients: Add action is surfaced in the page header so it is visible at first glance.
