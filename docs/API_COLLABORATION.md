# Collaboration API

Base path: `/api/collaboration` (JWT required)

## POST /invites
Invite a user by email.

Request:
```json
{ "email": "friend@example.com" }
```

Response:
```json
{
  "id": "uuid",
  "sender_id": "uuid",
  "recipient_id": "uuid",
  "status": "pending",
  "created_at": "2026-01-13T12:00:00.000Z",
  "updated_at": "2026-01-13T12:00:00.000Z"
}
```

Errors:
- `400` self-invite, duplicate pending, or already collaborators
- `404` user not found

## GET /invites
Returns incoming/outgoing invites.

Response:
```json
{
  "incoming": [
    { "id": "uuid", "sender_id": "uuid", "sender_email": "a@example.com", "status": "pending" }
  ],
  "outgoing": [
    { "id": "uuid", "recipient_id": "uuid", "recipient_email": "b@example.com", "status": "pending" }
  ]
}
```

## POST /invites/:id/accept
Accept invite (recipient only).

## POST /invites/:id/reject
Reject invite (recipient only).

## DELETE /invites/:id
Revoke pending invite (sender only).

## GET /partners
List active collaborators.

Response:
```json
[
  { "user_id": "uuid", "email": "partner@example.com", "since": "2026-01-13T12:05:00.000Z" }
]
```
