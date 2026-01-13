# UI Checklist (Milestone 4)

## Accessibility
- Focus visible on all interactive elements (buttons, links, inputs, selects).
- Icon-only controls include aria-label.
- Labels are associated to inputs/selects where possible.
- Text contrast remains readable on primary/accent surfaces.

## Responsiveness
- No horizontal scroll on 360x800 and 1366x768.
- Bottom nav remains reachable on mobile; sidebar nav does not overlap content on desktop.
- Dialogs scale to max 92vw on mobile.
- Tables are only shown on desktop, cards on mobile.

## Consistency
- Page headers are present on all main pages with title and context.
- Form fields use labels + inline errors with consistent spacing.
- Empty/error states use the shared state pattern.

## Performance UI
- Reduced motion respected via prefers-reduced-motion.
- Empty/error states use fixed min-height to reduce layout shift.
- Hover transitions are subtle and consistent.
