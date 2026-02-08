import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type Language = 'en' | 'pt-BR';

const LANG_KEY = 'gc_lang';
const DEFAULT_LANG: Language = 'en';

type TranslationValue = string | Record<string, unknown>;
type Translations = Record<string, TranslationValue>;

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _language = signal<Language>(this.getInitialLanguage());
  private readonly _translations = signal<Translations>({});
  private readonly _loaded = signal(false);

  readonly language = this._language.asReadonly();
  readonly loaded = this._loaded.asReadonly();

  readonly languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'pt-BR', name: 'Portugues' },
  ];

  async init(): Promise<void> {
    await this.loadTranslations(this._language());
  }

  async setLanguage(lang: Language): Promise<void> {
    if (lang === this._language()) return;

    this._language.set(lang);
    this.saveLanguage(lang);
    await this.loadTranslations(lang);
  }

  t(key: string, params?: Record<string, string | number>): string {
    const translations = this._translations();
    const value = this.getNestedValue(translations, key);

    if (typeof value !== 'string') {
      return key;
    }

    if (!params) {
      return value;
    }

    return Object.entries(params).reduce(
      (str, [paramKey, paramValue]) =>
        str.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue)),
      value
    );
  }

  private async loadTranslations(lang: Language): Promise<void> {
    try {
      const translations = await firstValueFrom(
        this.http.get<Translations>(`/assets/i18n/${lang}.json`)
      );
      this._translations.set(translations);
      this._loaded.set(true);
    } catch (error) {
      console.error(`Failed to load translations for ${lang}`, error);
      if (lang !== DEFAULT_LANG) {
        await this.loadTranslations(DEFAULT_LANG);
      }
    }
  }

  private getNestedValue(obj: Translations, path: string): TranslationValue | undefined {
    return path.split('.').reduce<TranslationValue | undefined>((current, key) => {
      if (current && typeof current === 'object' && key in current) {
        return (current as Record<string, TranslationValue>)[key];
      }
      return undefined;
    }, obj as TranslationValue);
  }

  private getInitialLanguage(): Language {
    if (!this.isBrowser) {
      return DEFAULT_LANG;
    }

    const stored = localStorage.getItem(LANG_KEY) as Language | null;
    if (stored === 'en' || stored === 'pt-BR') {
      return stored;
    }

    const browserLang = navigator.language;
    if (browserLang.startsWith('pt')) {
      return 'pt-BR';
    }

    return DEFAULT_LANG;
  }

  private saveLanguage(lang: Language): void {
    if (!this.isBrowser) return;
    localStorage.setItem(LANG_KEY, lang);
  }
}
