import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ListsService } from '../../core/services/lists.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-accept-invite',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './accept-invite.component.html',
})
export class AcceptInviteComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly listsService = inject(ListsService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly listId = signal('');
  readonly listName = signal('');

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.router.navigate(['/lists']);
      return;
    }

    this.listsService.acceptInvite(token).subscribe({
      next: (response) => {
        this.listId.set(response.listId);
        this.listName.set(response.listName);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'errors.inviteFailed');
        this.loading.set(false);
      },
    });
  }
}
