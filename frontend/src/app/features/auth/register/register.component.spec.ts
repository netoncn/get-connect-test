import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { RegisterComponent } from './register.component';
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

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
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
      imports: [RegisterComponent],
      providers: [
        { provide: AuthService, useValue: mockAuth },
        { provide: I18nService, useValue: mockI18n },
        { provide: ThemeService, useValue: mockTheme },
        provideRouter([]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have form with name, email and password controls', () => {
    expect(component.form.contains('name')).toBe(true);
    expect(component.form.contains('email')).toBe(true);
    expect(component.form.contains('password')).toBe(true);
  });

  it('should not call authService when form is invalid', () => {
    component.form.setValue({ name: '', email: '', password: '' });
    component.onSubmit();
    expect(mockAuth.register).not.toHaveBeenCalled();
  });

  it('should call authService.register with form values on valid form', () => {
    mockAuth.register.mockReturnValue(of({ accessToken: 'tok', user: { id: '1' } }));

    component.form.setValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    component.onSubmit();

    expect(mockAuth.register).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/lists']);
  });

  it('should set error signal on failure', () => {
    mockAuth.register.mockReturnValue(
      throwError(() => ({ error: { message: 'Email already exists' } }))
    );

    component.form.setValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    component.onSubmit();

    expect(component.error()).toBe('Email already exists');
    expect(component.loading()).toBe(false);
  });
});
