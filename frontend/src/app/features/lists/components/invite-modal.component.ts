import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

export interface InviteData {
  email: string;
  role: 'EDITOR' | 'VIEWER';
}

@Component({
  selector: 'app-invite-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './invite-modal.component.html',
})
export class InviteModalComponent {
  private readonly fb = inject(FormBuilder);

  isOpen = input(false);
  loading = input(false);

  invite = output<InviteData>();
  close = output<void>();

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    role: ['VIEWER' as 'EDITOR' | 'VIEWER'],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.invite.emit(this.form.getRawValue());
  }

  onClose(): void {
    this.form.reset({ email: '', role: 'VIEWER' });
    this.close.emit();
  }
}
