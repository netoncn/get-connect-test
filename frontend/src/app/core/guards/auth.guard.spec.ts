import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard, publicGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  it('should return true when authenticated', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isAuthenticated: vi.fn().mockReturnValue(true) } },
        { provide: Router, useValue: { createUrlTree: vi.fn().mockReturnValue({} as UrlTree) } },
      ],
    });

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('should redirect to /login when not authenticated', () => {
    const mockUrlTree = {} as UrlTree;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isAuthenticated: vi.fn().mockReturnValue(false) } },
        { provide: Router, useValue: { createUrlTree: vi.fn().mockReturnValue(mockUrlTree) } },
      ],
    });

    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBe(mockUrlTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});

describe('publicGuard', () => {
  it('should return true when not authenticated', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isAuthenticated: vi.fn().mockReturnValue(false) } },
        { provide: Router, useValue: { createUrlTree: vi.fn().mockReturnValue({} as UrlTree) } },
      ],
    });

    const result = TestBed.runInInjectionContext(() => publicGuard({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('should redirect to /lists when authenticated', () => {
    const mockUrlTree = {} as UrlTree;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isAuthenticated: vi.fn().mockReturnValue(true) } },
        { provide: Router, useValue: { createUrlTree: vi.fn().mockReturnValue(mockUrlTree) } },
      ],
    });

    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() => publicGuard({} as any, {} as any));

    expect(result).toBe(mockUrlTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/lists']);
  });
});
