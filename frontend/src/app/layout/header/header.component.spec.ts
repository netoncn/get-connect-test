import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { I18nService } from '../../core/services/i18n.service';

const mockI18n = {
  t: vi.fn((key: string) => key),
  language: vi.fn().mockReturnValue('en'),
  loaded: vi.fn().mockReturnValue(true),
  languages: [{ code: 'en', name: 'English' }],
  init: vi.fn(),
  setLanguage: vi.fn(),
};

const mockTheme = {
  theme: vi.fn().mockReturnValue('light'),
  isDark: vi.fn().mockReturnValue(false),
  toggle: vi.fn(),
  setTheme: vi.fn(),
};

const mockAuth = {
  login: vi.fn(),
  register: vi.fn(),
  isAuthenticated: vi.fn().mockReturnValue(true),
  user: vi.fn().mockReturnValue({ id: '1', name: 'Test', email: 'test@example.com' }),
  token: vi.fn().mockReturnValue('tok'),
  logout: vi.fn(),
};

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: AuthService, useValue: mockAuth },
        { provide: ThemeService, useValue: mockTheme },
        { provide: I18nService, useValue: mockI18n },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onLogout should call auth.logout', () => {
    component.showUserMenu = true;
    component.onLogout();

    expect(component.showUserMenu).toBe(false);
    expect(mockAuth.logout).toHaveBeenCalled();
  });

  it('onLanguageChange should call i18n.setLanguage', () => {
    component.showLangMenu = true;
    component.onLanguageChange('pt-BR' as any);

    expect(mockI18n.setLanguage).toHaveBeenCalledWith('pt-BR');
    expect(component.showLangMenu).toBe(false);
  });

  it('onDocumentClick should close menus', () => {
    component.showUserMenu = true;
    component.showLangMenu = true;

    const mockEvent = {
      target: {
        closest: vi.fn().mockReturnValue(null),
      } as unknown as HTMLElement,
    } as unknown as MouseEvent;

    component.onDocumentClick(mockEvent);

    expect(component.showUserMenu).toBe(false);
    expect(component.showLangMenu).toBe(false);
  });
});
