import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  let service: I18nService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    service = TestBed.inject(I18nService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('init() should load translations for default language', async () => {
    const translations = { greeting: 'Hello' };

    const initPromise = service.init();

    const req = httpTesting.expectOne('/assets/i18n/en.json');
    expect(req.request.method).toBe('GET');
    req.flush(translations);

    await initPromise;

    expect(service.language()).toBe('en');
    expect(service.loaded()).toBe(true);
  });

  it('setLanguage() should load new translations', async () => {
    const enTranslations = { greeting: 'Hello' };
    const ptTranslations = { greeting: 'Ola' };

    const initPromise = service.init();
    httpTesting.expectOne('/assets/i18n/en.json').flush(enTranslations);
    await initPromise;

    const setLangPromise = service.setLanguage('pt-BR');
    const req = httpTesting.expectOne('/assets/i18n/pt-BR.json');
    expect(req.request.method).toBe('GET');
    req.flush(ptTranslations);

    await setLangPromise;

    expect(service.language()).toBe('pt-BR');
    expect(service.t('greeting')).toBe('Ola');
  });

  it('t() should return translated string', async () => {
    const translations = { greeting: 'Hello', farewell: 'Goodbye' };

    const initPromise = service.init();
    httpTesting.expectOne('/assets/i18n/en.json').flush(translations);
    await initPromise;

    expect(service.t('greeting')).toBe('Hello');
    expect(service.t('farewell')).toBe('Goodbye');
  });

  it('t() should return key when not found', async () => {
    const translations = { greeting: 'Hello' };

    const initPromise = service.init();
    httpTesting.expectOne('/assets/i18n/en.json').flush(translations);
    await initPromise;

    expect(service.t('missing.key')).toBe('missing.key');
  });

  it('t() should interpolate params', async () => {
    const translations = { welcome: 'Hello, {{name}}! You have {{count}} messages.' };

    const initPromise = service.init();
    httpTesting.expectOne('/assets/i18n/en.json').flush(translations);
    await initPromise;

    expect(service.t('welcome', { name: 'Alice', count: 5 })).toBe(
      'Hello, Alice! You have 5 messages.'
    );
  });

  it('t() should handle nested keys', async () => {
    const translations = {
      nav: {
        home: 'Home',
        settings: {
          title: 'Settings',
        },
      },
    };

    const initPromise = service.init();
    httpTesting.expectOne('/assets/i18n/en.json').flush(translations);
    await initPromise;

    expect(service.t('nav.home')).toBe('Home');
    expect(service.t('nav.settings.title')).toBe('Settings');
  });
});
