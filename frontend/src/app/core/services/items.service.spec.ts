import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ItemsService } from './items.service';
import { ApiService } from './api.service';

describe('ItemsService', () => {
  let service: ItemsService;
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

    service = TestBed.inject(ItemsService);
  });

  it('getItems should call correct path', () => {
    const mockItems = [{ id: 'i1', title: 'Milk', done: false }];
    mockApi.get.mockReturnValue(of(mockItems));

    service.getItems('list1').subscribe((items) => {
      expect(items).toEqual(mockItems);
    });

    expect(mockApi.get).toHaveBeenCalledWith('/lists/list1/items');
  });

  it('createItem should call correct path and body', () => {
    const createData = { kind: 'OTHER' as const, title: 'Bread' };
    const mockResponse = { id: 'i2', title: 'Bread', done: false };
    mockApi.post.mockReturnValue(of(mockResponse));

    service.createItem('list1', createData).subscribe((result) => {
      expect(result).toEqual(mockResponse);
    });

    expect(mockApi.post).toHaveBeenCalledWith('/lists/list1/items', createData);
  });

  it('updateItem should call correct path and body', () => {
    const updateData = { title: 'Whole Wheat Bread', done: true };
    const mockResponse = { id: 'i2', title: 'Whole Wheat Bread', done: true };
    mockApi.patch.mockReturnValue(of(mockResponse));

    service.updateItem('list1', 'i2', updateData).subscribe((result) => {
      expect(result).toEqual(mockResponse);
    });

    expect(mockApi.patch).toHaveBeenCalledWith(
      '/lists/list1/items/i2',
      updateData
    );
  });

  it('deleteItem should call correct path', () => {
    mockApi.delete.mockReturnValue(of(undefined));

    service.deleteItem('list1', 'i2').subscribe();

    expect(mockApi.delete).toHaveBeenCalledWith('/lists/list1/items/i2');
  });
});
