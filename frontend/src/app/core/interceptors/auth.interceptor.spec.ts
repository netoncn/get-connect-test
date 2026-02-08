import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  describe('with token', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          { provide: AuthService, useValue: { token: vi.fn().mockReturnValue('test-token') } },
          provideHttpClient(withInterceptors([authInterceptor])),
          provideHttpClientTesting(),
        ],
      });

      http = TestBed.inject(HttpClient);
      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('should add Authorization header when token exists', () => {
      http.get('/test').subscribe();

      const req = httpMock.expectOne('/test');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      req.flush({});
    });
  });

  describe('without token', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          { provide: AuthService, useValue: { token: vi.fn().mockReturnValue(null) } },
          provideHttpClient(withInterceptors([authInterceptor])),
          provideHttpClientTesting(),
        ],
      });

      http = TestBed.inject(HttpClient);
      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('should not add Authorization header when token is null', () => {
      http.get('/test').subscribe();

      const req = httpMock.expectOne('/test');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });
  });
});
