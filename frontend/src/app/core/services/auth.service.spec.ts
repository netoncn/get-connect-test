import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { AuthResponse, User } from '../models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let mockApi: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  const mockUser: User = {
    id: 'u1',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date('2025-01-01'),
  };

  const mockAuthResponse: AuthResponse = {
    accessToken: 'mock-token-abc',
    user: mockUser,
  };

  beforeEach(() => {
    localStorage.clear();

    mockApi = {
      get: vi.fn().mockReturnValue(of([])),
      post: vi.fn().mockReturnValue(of({})),
      patch: vi.fn().mockReturnValue(of({})),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: ApiService, useValue: mockApi },
        { provide: Router, useValue: mockRouter },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('register should call api.post and set token/user signals', () => {
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };
    mockApi.post.mockReturnValue(of(mockAuthResponse));

    service.register(registerData).subscribe((response) => {
      expect(response).toEqual(mockAuthResponse);
    });

    expect(mockApi.post).toHaveBeenCalledWith('/auth/register', registerData);
    expect(service.user()).toEqual(mockUser);
    expect(service.token()).toBe('mock-token-abc');
  });

  it('login should call api.post and set token/user signals', () => {
    const loginData = { email: 'test@example.com', password: 'password123' };
    mockApi.post.mockReturnValue(of(mockAuthResponse));

    service.login(loginData).subscribe((response) => {
      expect(response).toEqual(mockAuthResponse);
    });

    expect(mockApi.post).toHaveBeenCalledWith('/auth/login', loginData);
    expect(service.user()).toEqual(mockUser);
    expect(service.token()).toBe('mock-token-abc');
  });

  it('login should save token to localStorage', () => {
    const loginData = { email: 'test@example.com', password: 'password123' };
    mockApi.post.mockReturnValue(of(mockAuthResponse));

    service.login(loginData).subscribe();

    expect(localStorage.getItem('gc_token')).toBe('mock-token-abc');
    expect(localStorage.getItem('gc_user')).toBe(JSON.stringify(mockUser));
  });

  it('getMe should call api.get and update user', () => {
    mockApi.post.mockReturnValue(of(mockAuthResponse));
    service.login({ email: 'test@example.com', password: 'p' }).subscribe();

    const updatedUser: User = { ...mockUser, name: 'Updated Name' };
    mockApi.get.mockReturnValue(of(updatedUser));

    service.getMe().subscribe((user) => {
      expect(user).toEqual(updatedUser);
    });

    expect(mockApi.get).toHaveBeenCalledWith('/auth/me');
    expect(service.user()).toEqual(updatedUser);
  });

  it('getMe should return null when no token', () => {
    service.getMe().subscribe((result) => {
      expect(result).toBeNull();
    });

    expect(mockApi.get).not.toHaveBeenCalled();
  });

  it('logout should clear signals and localStorage, navigate to /login', () => {
    mockApi.post.mockReturnValue(of(mockAuthResponse));
    service.login({ email: 'test@example.com', password: 'p' }).subscribe();

    expect(service.token()).toBe('mock-token-abc');

    service.logout();

    expect(service.user()).toBeNull();
    expect(service.token()).toBeNull();
    expect(localStorage.getItem('gc_token')).toBeNull();
    expect(localStorage.getItem('gc_user')).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('isAuthenticated should be false when no token', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('isAuthenticated should be true after login', () => {
    mockApi.post.mockReturnValue(of(mockAuthResponse));
    service.login({ email: 'test@example.com', password: 'p' }).subscribe();

    expect(service.isAuthenticated()).toBe(true);
  });
});
