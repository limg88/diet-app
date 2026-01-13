# Collaboration Design

## Overview
Implement a collaboration system where users can invite other users. When an invite is accepted, the two users become **active collaborators** and can view/edit each other’s current-week menu. The Shopping List aggregates ingredients from **the user’s menu + all active collaborators’ menus** (current week only, Europe/Rome).

## Data Model
### Table: collaboration_invites
- `id` uuid PK
- `sender_id` uuid FK -> users(id)
- `recipient_id` uuid FK -> users(id)
- `status` text CHECK in (`pending`, `accepted`, `rejected`, `revoked`)
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()
- Unique constraint: (`sender_id`, `recipient_id`, `status`) for `pending` (enforced in app logic)

### Active Collaboration
An **active collaboration** is any invite with `status = accepted`. Access is **bidirectional** between sender and recipient.

## Permissions
- **Invite:** only authenticated users. No self-invite.
- **Accept/Reject:** only the recipient of the invite.
- **Revoke/Cancel:** only the sender of the invite while `pending`.
- **Menu access:** owner = current user OR an accepted collaboration exists between current user and `ownerUserId`.
- **Edit rights:** bidirectional edit permission for active collaborators.

## API Contract (proposed)
### Invites
- `POST /collaboration/invites`
  - body: `{ email }`
  - errors: `400` (self-invite / duplicate pending / already collaborators), `404` (user not found)
- `GET /collaboration/invites`
  - returns `{ incoming: Invite[], outgoing: Invite[] }`
- `POST /collaboration/invites/:id/accept`
- `POST /collaboration/invites/:id/reject`
- `DELETE /collaboration/invites/:id` (revoke/cancel pending)

### Collaborators
- `GET /collaboration/partners`
  - returns `[{ userId, email, since }]`

### Menu (owner-aware)
- `GET /menu/current?ownerUserId=...`
- `POST /menu/current/meals/:mealId/items?ownerUserId=...`
- `PUT /menu/current/items/:itemId?ownerUserId=...`
- `DELETE /menu/current/items/:itemId?ownerUserId=...`

## UI Flows
### Collaboration page
- Invite form (email).
- Incoming invites: accept/reject.
- Outgoing invites: revoke pending.
- Active collaborators list: link to collaborator menu.

### Collaborator menu
- New route: `/collaborators/:collaboratorId/menu`
- Reuses Menu UI with `ownerUserId` param.
- Visual indicator: “Menu di <email>” + collaborator badge.

## Shopping Aggregation Impact
- Shopping aggregation includes menu items for:
  - current user
  - **all active collaborators**
- Aggregation key: `(ingredientId, unit)`
- Quantity = sum of quantities across all menus.
- `warehouse` remains a single value per aggregated item (shared).
- `toPurchase` computed in UI: `max(totalQuantity - warehouse, 0)`.

## Notes
- If multiple collaborators are active, Shopping aggregates all of them.
- Invites are user-to-user, not tied to a week.
