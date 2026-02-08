import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListMember, ListRole } from '../../../core/models/list.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './member-list.component.html',
})
export class MemberListComponent {
  members = input.required<ListMember[]>();
  isOwner = input(false);

  roleChange = output<{ member: ListMember; role: ListRole }>();
  removeMember = output<ListMember>();

  onRoleChange(member: ListMember, role: ListRole): void {
    this.roleChange.emit({ member, role });
  }

  onRemove(member: ListMember): void {
    this.removeMember.emit(member);
  }
}
