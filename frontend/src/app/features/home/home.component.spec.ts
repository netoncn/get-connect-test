import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './home.component';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';
import { ThemeService } from '../../core/services/theme.service';

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
  isAuthenticated: vi.fn().mockReturnValue(false),
  user: vi.fn().mockReturnValue(null),
  token: vi.fn().mockReturnValue(null),
  logout: vi.fn(),
};

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: AuthService, useValue: mockAuth },
        { provide: I18nService, useValue: mockI18n },
        { provide: ThemeService, useValue: mockTheme },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
