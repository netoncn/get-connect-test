import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { errorInterceptor } from './error.interceptor';
import { AuthService } from '../services/auth.service';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceMock: { token: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authServiceMock = {
      token: vi.fn().mockReturnValue(null),
      logout: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should call logout on 401 for API URL', () => {
    http.get('/api/users').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/users');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authServiceMock.logout).toHaveBeenCalled();
  });

  it('should NOT call logout on 401 for non-API URL', () => {
    http.get('https://external.com/data').subscribe({ error: () => {} });

    const req = httpMock.expectOne('https://external.com/data');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authServiceMock.logout).not.toHaveBeenCalled();
  });

  it('should pass through non-401 errors without logout', () => {
    http.get('/api/users').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/users');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

    expect(authServiceMock.logout).not.toHaveBeenCalled();
  });
});
