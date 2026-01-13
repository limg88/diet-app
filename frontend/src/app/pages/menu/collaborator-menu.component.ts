import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CollaborationApi } from '../../core/api/collaboration.api';
import { MenuPageComponent } from './menu-page.component';
import { ToastService } from '../../core/ui/toast.service';

@Component({
  selector: 'app-collaborator-menu',
  imports: [CommonModule, ProgressSpinnerModule, MenuPageComponent],
  templateUrl: './collaborator-menu.component.html',
  styleUrl: './collaborator-menu.component.scss',
})
export class CollaboratorMenuComponent implements OnInit {
  collaboratorId: string | null = null;
  collaboratorEmail = 'Collaborator';
  loading = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly collaborationApi: CollaborationApi,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.collaboratorId = params.get('collaboratorId');
      if (this.collaboratorId) {
        this.loadPartnerLabel(this.collaboratorId);
      }
    });
  }

  private loadPartnerLabel(collaboratorId: string) {
    this.loading = true;
    this.collaborationApi.listPartners().subscribe({
      next: (partners) => {
        const partner = partners.find((item) => item.user_id === collaboratorId);
        if (partner) {
          this.collaboratorEmail = partner.email;
        }
        this.loading = false;
      },
      error: (err) => {
        this.toastService.error(err?.error?.message ?? 'Failed to load collaborator');
        this.loading = false;
      },
    });
  }
}
