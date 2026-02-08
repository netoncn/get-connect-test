import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');

    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList);

    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  function createService(): ThemeService {
    return TestBed.inject(ThemeService);
  }

  it('should default to light theme', () => {
    service = createService();

    expect(service.theme()).toBe('light');
    expect(service.isDark()).toBe(false);
  });

  it('toggle() should switch light to dark', () => {
    service = createService();

    expect(service.theme()).toBe('light');

    service.toggle();

    expect(service.theme()).toBe('dark');
    expect(service.isDark()).toBe(true);
  });

  it('toggle() should switch dark to light', () => {
    localStorage.setItem('gc_theme', 'dark');

    service = createService();
    expect(service.theme()).toBe('dark');

    service.toggle();

    expect(service.theme()).toBe('light');
    expect(service.isDark()).toBe(false);
  });

  it('setTheme("dark") should add "dark" class to html element', () => {
    service = createService();

    expect(document.documentElement.classList.contains('dark')).toBe(false);

    service.setTheme('dark');

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(service.theme()).toBe('dark');
  });

  it('should read stored theme from localStorage', () => {
    localStorage.setItem('gc_theme', 'dark');

    service = createService();

    expect(service.theme()).toBe('dark');
    expect(service.isDark()).toBe(true);
  });
});
