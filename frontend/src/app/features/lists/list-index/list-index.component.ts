import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ListsService } from '../../../core/services/lists.service';
import { List } from '../../../core/models/list.model';
import { PendingInvite } from '../../../core/models/invite.model';
import { ListCardComponent } from '../components/list-card.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-list-index',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ListCardComponent, TranslatePipe],
  templateUrl: './list-index.component.html',
})
export class ListIndexComponent implements OnInit {
  private readonly listsService = inject(ListsService);
  private readonly fb = inject(FormBuilder);

  readonly lists = signal<List[]>([]);
  readonly pendingInvites = signal<PendingInvite[]>([]);
  readonly loading = signal(true);
  readonly showCreateModal = signal(false);
  readonly creating = signal(false);

  readonly createForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
  });

  ngOnInit(): void {
    this.loadLists();
    this.loadPendingInvites();
  }

  loadLists(): void {
    this.loading.set(true);
    this.listsService.getLists().subscribe({
      next: (lists) => {
        this.lists.set(lists);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  loadPendingInvites(): void {
    this.listsService.getPendingInvites().subscribe({
      next: (invites) => this.pendingInvites.set(invites),
    });
  }

  onAcceptInvite(invite: PendingInvite): void {
    this.listsService.acceptInviteById(invite.id).subscribe({
      next: () => {
        this.pendingInvites.update((invites) =>
          invites.filter((i) => i.id !== invite.id)
        );
        this.loadLists();
      },
    });
  }

  onRejectInvite(invite: PendingInvite): void {
    this.listsService.rejectInvite(invite.id).subscribe({
      next: () => {
        this.pendingInvites.update((invites) =>
          invites.filter((i) => i.id !== invite.id)
        );
      },
    });
  }

  closeModal(): void {
    this.showCreateModal.set(false);
    this.createForm.reset();
  }

  onCreate(): void {
    if (this.createForm.invalid) return;

    this.creating.set(true);
    const { name } = this.createForm.getRawValue();

    this.listsService.createList({ name }).subscribe({
      next: (list) => {
        this.lists.update((lists) => [list, ...lists]);
        this.creating.set(false);
        this.closeModal();
      },
      error: () => {
        this.creating.set(false);
      },
    });
  }
}
