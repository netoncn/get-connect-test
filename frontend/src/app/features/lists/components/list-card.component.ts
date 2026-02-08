import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { List } from '../../../core/models/list.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-list-card',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './list-card.component.html',
})
export class ListCardComponent {
  list = input.required<List>();

  getRoleBadgeClass(): string {
    const role = this.list().userRole;
    switch (role) {
      case 'OWNER':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'EDITOR':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  getRoleLabel(): string {
    const role = this.list().userRole;
    switch (role) {
      case 'OWNER':
        return 'members.owner';
      case 'EDITOR':
        return 'members.editor';
      default:
        return 'members.viewer';
    }
  }
}
