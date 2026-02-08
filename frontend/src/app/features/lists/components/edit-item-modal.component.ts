import { Component, input, output, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ListItem } from '../../../core/models/item.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

export interface EditItemData {
  title: string;
  notes?: string;
}

@Component({
  selector: 'app-edit-item-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './edit-item-modal.component.html',
})
export class EditItemModalComponent {
  private readonly fb = inject(FormBuilder);

  isOpen = input(false);
  item = input<ListItem | null>(null);
  loading = input(false);

  save = output<EditItemData>();
  close = output<void>();

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    notes: [''],
  });

  constructor() {
    effect(() => {
      const currentItem = this.item();
      if (currentItem) {
        this.form.patchValue({
          title: currentItem.title,
          notes: currentItem.notes ?? '',
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const { title, notes } = this.form.getRawValue();
    this.save.emit({ title, notes: notes || undefined });
  }

  onClose(): void {
    this.form.reset({ title: '', notes: '' });
    this.close.emit();
  }
}
