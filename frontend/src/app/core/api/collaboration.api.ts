import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CollaborationInvites, CollaborationInvite, Collaborator } from './api.types';

@Injectable({ providedIn: 'root' })
export class CollaborationApi {
  constructor(private readonly http: HttpClient) {}

  createInvite(email: string) {
    return this.http.post<CollaborationInvite>(
      `${environment.apiBaseUrl}/collaboration/invites`,
      { email },
    );
  }

  listInvites() {
    return this.http.get<CollaborationInvites>(
      `${environment.apiBaseUrl}/collaboration/invites`,
    );
  }

  acceptInvite(id: string) {
    return this.http.post<CollaborationInvite>(
      `${environment.apiBaseUrl}/collaboration/invites/${id}/accept`,
      {},
    );
  }

  rejectInvite(id: string) {
    return this.http.post<CollaborationInvite>(
      `${environment.apiBaseUrl}/collaboration/invites/${id}/reject`,
      {},
    );
  }

  revokeInvite(id: string) {
    return this.http.delete<CollaborationInvite>(
      `${environment.apiBaseUrl}/collaboration/invites/${id}`,
    );
  }

  listPartners() {
    return this.http.get<Collaborator[]>(
      `${environment.apiBaseUrl}/collaboration/partners`,
    );
  }
}
