import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthHeaderComponent } from '../../layout/auth-header/auth-header.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, AuthHeaderComponent, TranslatePipe],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  readonly auth = inject(AuthService);
}
