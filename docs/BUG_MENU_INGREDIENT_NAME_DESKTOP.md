# Bug: Menu ingredient name invisible on some desktop resolutions

## Steps to reproduce
1. Open `/menu`.
2. Set a desktop viewport (tested: 1024x768, 1280x720, 1366x768, 1440x900, 1920x1080).
3. Add an ingredient to a meal (e.g. Lunch) and observe the ingredient row.

## Affected viewports
- 1024x768 (most visible when columns are tight)
- 1280x720 (intermittent, depends on content length)

## Non-affected viewports
- Mobile (accordion view)
- 1440x900 and larger (more horizontal space)

## Root cause
In the desktop grid, meal items are laid out with CSS grid columns `minmax(0, 1fr) auto auto` while the name span is capped by `max-width`. When the input + unit + remove button consume most of the cell width, the name column collapses to near-zero width, making the name appear invisible at certain desktop widths.

## Fix
On desktop, enforce a minimum width for the name column and allow the name span to grow to the available width:
- Use `grid-template-columns: minmax(10rem, 1fr) auto auto` for item rows.
- Remove the hard `max-width` cap on desktop (`max-width: 100%`).

## Verification checklist
- 1024x768, 1280x720, 1366x768, 1440x900, 1920x1080: name visible.
- 360x800 (mobile): layout unchanged.
- Long ingredient names still ellipsize and do not overlap quantity controls.
