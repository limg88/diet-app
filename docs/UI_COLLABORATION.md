# Collaboration UI

## Flow
1. Open `/collaboration`.
2. Send an invite by email.
3. Recipient sees invite in Incoming section and accepts/rejects.
4. Accepted collaborators appear in Active list with a link to open their menu.

## Manual Checks
- Invite form validates email and shows toast on success/failure.
- Incoming invite actions (accept/reject) update the list.
- Outgoing invite can be revoked while pending.
- Active collaborators list renders and links to `/collaborators/:id/menu`.

## Data-cy hooks
- `collaboration-invite-email`
- `collaboration-invite-submit`
- `collaboration-incoming`
- `collaboration-accept`
- `collaboration-reject`
- `collaboration-outgoing`
- `collaboration-revoke`
- `collaboration-partners`
- `collaboration-open-menu`
