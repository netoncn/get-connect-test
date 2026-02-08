import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('get() should call the correct URL', () => {
    const mockData = { id: '1', name: 'Test' };

    service.get('/users').subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpTesting.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('get() with params should pass HttpParams', () => {
    const mockData = [{ id: '1' }];

    service
      .get('/search', { query: 'test', page: 1, active: true })
      .subscribe((data) => {
        expect(data).toEqual(mockData);
      });

    const req = httpTesting.expectOne(
      (r) => r.url === '/api/search'
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('query')).toBe('test');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('active')).toBe('true');
    req.flush(mockData);
  });

  it('post() should call with body', () => {
    const body = { name: 'New Item' };
    const mockResponse = { id: '1', name: 'New Item' };

    service.post('/items', body).subscribe((data) => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpTesting.expectOne('/api/items');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mockResponse);
  });

  it('patch() should call with body', () => {
    const body = { name: 'Updated' };
    const mockResponse = { id: '1', name: 'Updated' };

    service.patch('/items/1', body).subscribe((data) => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpTesting.expectOne('/api/items/1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(body);
    req.flush(mockResponse);
  });

  it('delete() should call the correct URL', () => {
    service.delete('/items/1').subscribe((data) => {
      expect(data).toBeNull();
    });

    const req = httpTesting.expectOne('/api/items/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
