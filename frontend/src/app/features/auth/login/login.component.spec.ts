import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ThemeService } from '../../../core/services/theme.service';
import { of, throwError } from 'rxjs';

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

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuth: any;
  let router: Router;

  beforeEach(async () => {
    mockAuth = {
      login: vi.fn(),
      register: vi.fn(),
      isAuthenticated: vi.fn().mockReturnValue(false),
      user: vi.fn().mockReturnValue(null),
      token: vi.fn().mockReturnValue(null),
      logout: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: mockAuth },
        { provide: I18nService, useValue: mockI18n },
        { provide: ThemeService, useValue: mockTheme },
        provideRouter([]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have form with email and password controls', () => {
    expect(component.form.contains('email')).toBe(true);
    expect(component.form.contains('password')).toBe(true);
  });

  it('should not call authService when form is invalid', () => {
    component.form.setValue({ email: '', password: '' });
    component.onSubmit();
    expect(mockAuth.login).not.toHaveBeenCalled();
  });

  it('should call authService.login with form values on valid form', async () => {
    mockAuth.login.mockReturnValue(of({ accessToken: 'tok', user: { id: '1' } }));

    component.form.setValue({ email: 'test@example.com', password: 'password123' });
    component.onSubmit();

    expect(mockAuth.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/lists']);
  });

  it('should set error signal on failure', () => {
    mockAuth.login.mockReturnValue(
      throwError(() => ({ error: { message: 'Invalid credentials' } }))
    );

    component.form.setValue({ email: 'test@example.com', password: 'wrong' });
    component.onSubmit();

    expect(component.error()).toBe('Invalid credentials');
    expect(component.loading()).toBe(false);
  });
});
