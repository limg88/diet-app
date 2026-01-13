CREATE TABLE IF NOT EXISTS collaboration_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_collaboration_invites_sender ON collaboration_invites(sender_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_invites_recipient ON collaboration_invites(recipient_id);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_collaboration_invites_pending
  ON collaboration_invites(sender_id, recipient_id)
  WHERE status = 'pending';
