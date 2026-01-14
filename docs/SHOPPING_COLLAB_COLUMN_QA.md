# Shopping List Collaborator Column - QA Checklist

## Viewports
- 360x800 (mobile)
- 390x844 (mobile)
- 1280x800 (desktop)

## Scenarios
- With active collaborator and shared menu items:
  - Collaborator column shows entries and quantities.
  - Totals remain unchanged.
- Without collaborators:
  - Column displays `—`.
- Long collaborator emails:
  - Text wraps without breaking layout.

## Regression checks
- Ingredients list remains unaffected.
- Shopping totals, warehouse, and purchased toggles behave as before.
