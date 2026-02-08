import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ListsService } from '../../../core/services/lists.service';
import { ItemsService } from '../../../core/services/items.service';
import { ListDetail, ListMember, ListRole } from '../../../core/models/list.model';
import { ListItem } from '../../../core/models/item.model';
import { MemberListComponent } from '../components/member-list.component';
import { InviteModalComponent, InviteData } from '../components/invite-modal.component';
import { ItemListComponent } from '../components/item-list.component';
import { ItemFormComponent, ItemFormData } from '../components/item-form.component';
import { EditItemModalComponent, EditItemData } from '../components/edit-item-modal.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-list-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MemberListComponent,
    InviteModalComponent,
    ItemListComponent,
    ItemFormComponent,
    EditItemModalComponent,
    TranslatePipe,
  ],
  templateUrl: './list-detail.component.html',
})
export class ListDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly listsService = inject(ListsService);
  private readonly itemsService = inject(ItemsService);

  readonly list = signal<ListDetail | null>(null);
  readonly items = signal<ListItem[]>([]);
  readonly loading = signal(true);
  readonly activeTab = signal<'items' | 'members'>('items');
  readonly showInviteModal = signal(false);
  readonly showDeleteConfirm = signal(false);
  readonly sendingInvite = signal(false);
  readonly inviteError = signal<string | null>(null);
  readonly addingItem = signal(false);
  readonly deletingList = signal(false);
  readonly showEditItemModal = signal(false);
  readonly editingItem = signal<ListItem | null>(null);
  readonly savingItem = signal(false);

  readonly isOwner = computed(() => this.list()?.userRole === 'OWNER');
  readonly canEdit = computed(() => {
    const role = this.list()?.userRole;
    return role === 'OWNER' || role === 'EDITOR';
  });

  private listId = '';

  ngOnInit(): void {
    this.listId = this.route.snapshot.paramMap.get('listId') || '';
    this.loadList();
    this.loadItems();
  }

  loadList(): void {
    this.listsService.getList(this.listId).subscribe({
      next: (list) => {
        this.list.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.router.navigate(['/lists']);
      },
    });
  }

  loadItems(): void {
    this.itemsService.getItems(this.listId).subscribe({
      next: (items) => this.items.set(items),
    });
  }

  onAddItem(data: ItemFormData): void {
    this.addingItem.set(true);
    this.itemsService.createItem(this.listId, data).subscribe({
      next: (item) => {
        this.items.update((items) => [item, ...items]);
        this.addingItem.set(false);
      },
      error: () => this.addingItem.set(false),
    });
  }

  onToggleDone(item: ListItem): void {
    this.itemsService.updateItem(this.listId, item.id, { done: !item.done }).subscribe({
      next: (updated) => {
        this.items.update((items) =>
          items.map((i) => (i.id === updated.id ? updated : i))
        );
      },
    });
  }

  onDeleteItem(item: ListItem): void {
    this.itemsService.deleteItem(this.listId, item.id).subscribe({
      next: () => {
        this.items.update((items) => items.filter((i) => i.id !== item.id));
      },
    });
  }

  onEditItem(item: ListItem): void {
    this.editingItem.set(item);
    this.showEditItemModal.set(true);
  }

  onSaveItem(data: EditItemData): void {
    const item = this.editingItem();
    if (!item) return;
    this.savingItem.set(true);
    this.itemsService.updateItem(this.listId, item.id, data).subscribe({
      next: (updated) => {
        this.items.update((items) =>
          items.map((i) => (i.id === updated.id ? updated : i))
        );
        this.savingItem.set(false);
        this.showEditItemModal.set(false);
        this.editingItem.set(null);
      },
      error: () => this.savingItem.set(false),
    });
  }

  onCloseEditModal(): void {
    this.showEditItemModal.set(false);
    this.editingItem.set(null);
  }

  onInvite(data: InviteData): void {
    this.sendingInvite.set(true);
    this.inviteError.set(null);
    this.listsService.createInvite(this.listId, data).subscribe({
      next: () => {
        this.sendingInvite.set(false);
        this.showInviteModal.set(false);
      },
      error: (err) => {
        this.sendingInvite.set(false);
        if (err.status === 404) {
          this.inviteError.set('members.userNotFound');
        }
      },
    });
  }

  onRoleChange(event: { member: ListMember; role: ListRole }): void {
    if (event.role === 'OWNER') return;
    this.listsService
      .updateMemberRole(this.listId, event.member.userId, { role: event.role })
      .subscribe({
        next: (updated) => {
          this.list.update((list) =>
            list
              ? {
                  ...list,
                  members: list.members.map((m) =>
                    m.id === updated.id ? updated : m
                  ),
                }
              : null
          );
        },
      });
  }

  onRemoveMember(member: ListMember): void {
    this.listsService.removeMember(this.listId, member.userId).subscribe({
      next: () => {
        this.list.update((list) =>
          list
            ? {
                ...list,
                members: list.members.filter((m) => m.id !== member.id),
              }
            : null
        );
      },
    });
  }

  onDeleteList(): void {
    this.deletingList.set(true);
    this.listsService.deleteList(this.listId).subscribe({
      next: () => this.router.navigate(['/lists']),
      error: () => this.deletingList.set(false),
    });
  }
}
