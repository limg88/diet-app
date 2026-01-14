# Shopping List - Collaborator column spec

## Current hover/tooltip behavior
- Shopping List shows collaborator breakdown via `title` attribute on the ingredient name.
- Tooltip content is built from `item.breakdown` and includes labels (e.g. `You`, collaborator email) and quantities.
- This hover-only behavior is not accessible on mobile.

## Data mapping
- Source: `ShoppingItem.breakdown` from the Shopping API.
- Each entry is `{ label, quantity }` and already resolved to user-facing labels.

## Column format decision
- New dedicated column label: **Collaborator**.
- Display **only collaborator entries** (exclude label `You`).
- Format per line: `label: quantity unit` (e.g. `collab@example.com: 120 gr`).
- If there are no collaborator entries, show `—`.

## Responsive behavior
- Desktop table: new column placed after **Quantity**.
- Mobile cards: add a small “Collaborators” section under meta chips with wrapped text.
- Text wraps; no hover/tooltip required.

## Tooltip decision
- Removed the hover-only tooltip because collaborator info is now always visible.
