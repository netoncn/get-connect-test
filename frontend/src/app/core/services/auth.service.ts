import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { ApiService } from './api.service';
import {
  User,
  AuthResponse,
  RegisterRequest,
  LoginRequest,
} from '../models/user.model';

const TOKEN_KEY = 'gc_token';
const USER_KEY = 'gc_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly _user = signal<User | null>(this.loadUserFromStorage());
  private readonly _token = signal<string | null>(this.loadTokenFromStorage());

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/register', data).pipe(
      tap((response) => this.handleAuthSuccess(response))
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', data).pipe(
      tap((response) => this.handleAuthSuccess(response))
    );
  }

  getMe(): Observable<User | null> {
    if (!this._token()) {
      return of(null);
    }

    return this.api.get<User>('/auth/me').pipe(
      tap((user) => {
        this._user.set(user);
        this.saveUserToStorage(user);
      }),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  logout(): void {
    this._user.set(null);
    this._token.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.router.navigate(['/login']);
  }

  private handleAuthSuccess(response: AuthResponse): void {
    this._token.set(response.accessToken);
    this._user.set(response.user);
    this.saveTokenToStorage(response.accessToken);
    this.saveUserToStorage(response.user);
  }

  private loadTokenFromStorage(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private loadUserFromStorage(): User | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  private saveTokenToStorage(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  private saveUserToStorage(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}
