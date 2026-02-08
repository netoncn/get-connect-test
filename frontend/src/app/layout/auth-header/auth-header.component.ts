import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { I18nService, Language } from '../../core/services/i18n.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-auth-header',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './auth-header.component.html',
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class AuthHeaderComponent {
  readonly theme = inject(ThemeService);
  readonly i18n = inject(I18nService);

  showLangMenu = false;

  onLanguageChange(lang: Language): void {
    this.i18n.setLanguage(lang);
    this.showLangMenu = false;
  }

  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showLangMenu = false;
    }
  }
}
