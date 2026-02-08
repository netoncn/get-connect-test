import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListItem } from '../../../core/models/item.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './item-list.component.html',
})
export class ItemListComponent {
  items = input.required<ListItem[]>();
  canEdit = input(false);

  toggleDone = output<ListItem>();
  deleteItem = output<ListItem>();
  editItem = output<ListItem>();
}
