import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateInviteDto } from './dto/create-invite.dto';

type InviteRow = {
  id: string;
  sender_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'revoked';
  created_at: string;
  updated_at: string;
  sender_email?: string;
  recipient_email?: string;
};

@Injectable()
export class CollaborationService {
  constructor(private readonly db: DatabaseService) {}

  async createInvite(userId: string, dto: CreateInviteDto) {
    const recipient = await this.db.query<{ id: string }>(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [dto.email],
    );
    if (recipient.rowCount === 0) {
      throw new NotFoundException('User not found');
    }
    const recipientId = recipient.rows[0].id;
    if (recipientId === userId) {
      throw new BadRequestException('Cannot invite yourself');
    }

    const existing = await this.db.query<{ id: string }>(
      `SELECT id
       FROM collaboration_invites
       WHERE status IN ('pending', 'accepted')
         AND ((sender_id = $1 AND recipient_id = $2) OR (sender_id = $2 AND recipient_id = $1))`,
      [userId, recipientId],
    );
    if (existing.rowCount && existing.rowCount > 0) {
      throw new BadRequestException('Invite already exists or users are collaborators');
    }

    const result = await this.db.query<InviteRow>(
      `INSERT INTO collaboration_invites (sender_id, recipient_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING id, sender_id, recipient_id, status, created_at, updated_at`,
      [userId, recipientId],
    );

    return result.rows[0];
  }

  async listInvites(userId: string) {
    const outgoing = await this.db.query<InviteRow>(
      `SELECT ci.id, ci.sender_id, ci.recipient_id, ci.status, ci.created_at, ci.updated_at,
              u.email AS recipient_email
       FROM collaboration_invites ci
       JOIN users u ON u.id = ci.recipient_id
       WHERE ci.sender_id = $1
       ORDER BY ci.created_at DESC`,
      [userId],
    );

    const incoming = await this.db.query<InviteRow>(
      `SELECT ci.id, ci.sender_id, ci.recipient_id, ci.status, ci.created_at, ci.updated_at,
              u.email AS sender_email
       FROM collaboration_invites ci
       JOIN users u ON u.id = ci.sender_id
       WHERE ci.recipient_id = $1
       ORDER BY ci.created_at DESC`,
      [userId],
    );

    return { outgoing: outgoing.rows, incoming: incoming.rows };
  }

  async acceptInvite(userId: string, inviteId: string) {
    const invite = await this.findInviteForRecipient(userId, inviteId);
    if (invite.status !== 'pending') {
      throw new BadRequestException('Invite is not pending');
    }

    const result = await this.db.query<InviteRow>(
      `UPDATE collaboration_invites
       SET status = 'accepted', updated_at = now()
       WHERE id = $1
       RETURNING id, sender_id, recipient_id, status, created_at, updated_at`,
      [inviteId],
    );
    return result.rows[0];
  }

  async rejectInvite(userId: string, inviteId: string) {
    const invite = await this.findInviteForRecipient(userId, inviteId);
    if (invite.status !== 'pending') {
      throw new BadRequestException('Invite is not pending');
    }

    const result = await this.db.query<InviteRow>(
      `UPDATE collaboration_invites
       SET status = 'rejected', updated_at = now()
       WHERE id = $1
       RETURNING id, sender_id, recipient_id, status, created_at, updated_at`,
      [inviteId],
    );
    return result.rows[0];
  }

  async revokeInvite(userId: string, inviteId: string) {
    const invite = await this.findInviteForSender(userId, inviteId);
    if (invite.status !== 'pending') {
      throw new BadRequestException('Invite is not pending');
    }

    const result = await this.db.query<InviteRow>(
      `UPDATE collaboration_invites
       SET status = 'revoked', updated_at = now()
       WHERE id = $1
       RETURNING id, sender_id, recipient_id, status, created_at, updated_at`,
      [inviteId],
    );
    return result.rows[0];
  }

  async listPartners(userId: string) {
    const result = await this.db.query<{ user_id: string; email: string; since: string }>(
      `SELECT
         CASE WHEN ci.sender_id = $1 THEN ci.recipient_id ELSE ci.sender_id END AS user_id,
         CASE WHEN ci.sender_id = $1 THEN u_rec.email ELSE u_send.email END AS email,
         ci.updated_at AS since
       FROM collaboration_invites ci
       JOIN users u_send ON u_send.id = ci.sender_id
       JOIN users u_rec ON u_rec.id = ci.recipient_id
       WHERE ci.status = 'accepted' AND (ci.sender_id = $1 OR ci.recipient_id = $1)
       ORDER BY ci.updated_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async listPartnerIds(userId: string) {
    const result = await this.db.query<{ user_id: string }>(
      `SELECT CASE WHEN sender_id = $1 THEN recipient_id ELSE sender_id END AS user_id
       FROM collaboration_invites
       WHERE status = 'accepted' AND (sender_id = $1 OR recipient_id = $1)`,
      [userId],
    );
    return result.rows.map((row) => row.user_id);
  }

  async hasActiveCollaboration(userId: string, otherUserId: string) {
    const result = await this.db.query<{ id: string }>(
      `SELECT id
       FROM collaboration_invites
       WHERE status = 'accepted'
         AND ((sender_id = $1 AND recipient_id = $2) OR (sender_id = $2 AND recipient_id = $1))
       LIMIT 1`,
      [userId, otherUserId],
    );
    return (result.rowCount ?? 0) > 0;
  }

  private async findInviteForRecipient(userId: string, inviteId: string) {
    const result = await this.db.query<InviteRow>(
      `SELECT id, sender_id, recipient_id, status, created_at, updated_at
       FROM collaboration_invites
       WHERE id = $1 AND recipient_id = $2`,
      [inviteId, userId],
    );
    if (result.rowCount === 0) {
      throw new NotFoundException('Invite not found');
    }
    return result.rows[0];
  }

  private async findInviteForSender(userId: string, inviteId: string) {
    const result = await this.db.query<InviteRow>(
      `SELECT id, sender_id, recipient_id, status, created_at, updated_at
       FROM collaboration_invites
       WHERE id = $1 AND sender_id = $2`,
      [inviteId, userId],
    );
    if (result.rowCount === 0) {
      throw new NotFoundException('Invite not found');
    }
    return result.rows[0];
  }
}
