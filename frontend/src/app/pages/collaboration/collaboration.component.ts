import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { CollaborationApi } from '../../core/api/collaboration.api';
import { CollaborationInvite, Collaborator } from '../../core/api/api.types';
import { ToastService } from '../../core/ui/toast.service';

@Component({
  selector: 'app-collaboration',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    CardModule,
    InputTextModule,
    ProgressSpinnerModule,
    TagModule,
  ],
  templateUrl: './collaboration.component.html',
  styleUrl: './collaboration.component.scss',
})
export class CollaborationComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  loadingInvites = false;
  loadingPartners = false;
  savingInvite = false;
  busyIds = new Set<string>();

  incoming: CollaborationInvite[] = [];
  outgoing: CollaborationInvite[] = [];
  partners: Collaborator[] = [];

  inviteForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(
    private readonly collaborationApi: CollaborationApi,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit() {
    this.loadInvites();
    this.loadPartners();
  }

  loadInvites() {
    this.loadingInvites = true;
    this.collaborationApi.listInvites().subscribe({
      next: (response) => {
        this.incoming = response.incoming ?? [];
        this.outgoing = response.outgoing ?? [];
        this.loadingInvites = false;
      },
      error: (err) => {
        this.toastService.error(err?.error?.message ?? 'Failed to load invites');
        this.loadingInvites = false;
      },
    });
  }

  loadPartners() {
    this.loadingPartners = true;
    this.collaborationApi.listPartners().subscribe({
      next: (response) => {
        this.partners = response ?? [];
        this.loadingPartners = false;
      },
      error: (err) => {
        this.toastService.error(err?.error?.message ?? 'Failed to load collaborators');
        this.loadingPartners = false;
      },
    });
  }

  submitInvite() {
    if (this.inviteForm.invalid) {
      this.inviteForm.markAllAsTouched();
      return;
    }

    const email = this.inviteForm.value.email?.trim();
    if (!email) return;

    this.savingInvite = true;
    this.collaborationApi.createInvite(email).subscribe({
      next: () => {
        this.toastService.success('Invite sent');
        this.inviteForm.reset({ email: '' });
        this.savingInvite = false;
        this.loadInvites();
      },
      error: (err) => {
        this.toastService.error(err?.error?.message ?? 'Invite failed');
        this.savingInvite = false;
      },
    });
  }

  acceptInvite(invite: CollaborationInvite) {
    if (this.busyIds.has(invite.id)) return;
    this.busyIds.add(invite.id);
    this.collaborationApi.acceptInvite(invite.id).subscribe({
      next: () => {
        this.toastService.success('Invite accepted');
        this.busyIds.delete(invite.id);
        this.loadInvites();
        this.loadPartners();
      },
      error: (err) => {
        this.toastService.error(err?.error?.message ?? 'Accept failed');
        this.busyIds.delete(invite.id);
      },
    });
  }

  rejectInvite(invite: CollaborationInvite) {
    if (this.busyIds.has(invite.id)) return;
    this.busyIds.add(invite.id);
    this.collaborationApi.rejectInvite(invite.id).subscribe({
      next: () => {
        this.toastService.info('Invite rejected');
        this.busyIds.delete(invite.id);
        this.loadInvites();
      },
      error: (err) => {
        this.toastService.error(err?.error?.message ?? 'Reject failed');
        this.busyIds.delete(invite.id);
      },
    });
  }

  revokeInvite(invite: CollaborationInvite) {
    if (this.busyIds.has(invite.id)) return;
    this.busyIds.add(invite.id);
    this.collaborationApi.revokeInvite(invite.id).subscribe({
      next: () => {
        this.toastService.info('Invite revoked');
        this.busyIds.delete(invite.id);
        this.loadInvites();
      },
      error: (err) => {
        this.toastService.error(err?.error?.message ?? 'Revoke failed');
        this.busyIds.delete(invite.id);
      },
    });
  }

  isBusy(invite: CollaborationInvite) {
    return this.busyIds.has(invite.id);
  }

  trackById(_index: number, invite: CollaborationInvite) {
    return invite.id;
  }

  trackByPartnerId(_index: number, partner: Collaborator) {
    return partner.user_id;
  }
}
