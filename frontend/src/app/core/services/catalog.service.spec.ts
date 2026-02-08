import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CatalogService } from './catalog.service';
import { ApiService } from './api.service';

describe('CatalogService', () => {
  let service: CatalogService;
  let mockApi: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockApi = {
      get: vi.fn().mockReturnValue(of([])),
      post: vi.fn().mockReturnValue(of({})),
      patch: vi.fn().mockReturnValue(of({})),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useValue: mockApi }],
    });

    service = TestBed.inject(CatalogService);
  });

  it('suggest should call api.get("/catalog/suggest", { query })', () => {
    const mockResponse = {
      suggestions: [
        { kind: 'BOOK' as const, title: 'Clean Code', authors: ['Robert C. Martin'] },
      ],
    };
    mockApi.get.mockReturnValue(of(mockResponse));

    service.suggest('clean').subscribe((result) => {
      expect(result).toEqual(mockResponse);
      expect(result.suggestions).toHaveLength(1);
      expect(result.suggestions[0].title).toBe('Clean Code');
    });

    expect(mockApi.get).toHaveBeenCalledWith('/catalog/suggest', { query: 'clean' });
  });

  it('should pass query param correctly', () => {
    const mockEmpty = { suggestions: [] };
    mockApi.get.mockReturnValue(of(mockEmpty));

    service.suggest('design patterns').subscribe((result) => {
      expect(result.suggestions).toEqual([]);
    });

    expect(mockApi.get).toHaveBeenCalledWith('/catalog/suggest', {
      query: 'design patterns',
    });
  });
});
