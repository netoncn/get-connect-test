import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ListsService } from './lists.service';
import { ApiService } from './api.service';

describe('ListsService', () => {
  let service: ListsService;
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

    service = TestBed.inject(ListsService);
  });

  it('getLists should call api.get("/lists")', () => {
    const mockLists = [{ id: '1', name: 'Groceries' }];
    mockApi.get.mockReturnValue(of(mockLists));

    service.getLists().subscribe((lists) => {
      expect(lists).toEqual(mockLists);
    });

    expect(mockApi.get).toHaveBeenCalledWith('/lists');
  });

  it('getList should call api.get("/lists/id")', () => {
    const mockDetail = { id: 'abc', name: 'My List', members: [] };
    mockApi.get.mockReturnValue(of(mockDetail));

    service.getList('abc').subscribe((detail) => {
      expect(detail).toEqual(mockDetail);
    });

    expect(mockApi.get).toHaveBeenCalledWith('/lists/abc');
  });

  it('createList should call api.post("/lists", data)', () => {
    const createData = { name: 'New List' };
    const mockResponse = { id: '2', name: 'New List' };
    mockApi.post.mockReturnValue(of(mockResponse));

    service.createList(createData).subscribe((result) => {
      expect(result).toEqual(mockResponse);
    });

    expect(mockApi.post).toHaveBeenCalledWith('/lists', createData);
  });

  it('updateList should call api.patch("/lists/id", data)', () => {
    const updateData = { name: 'Renamed List' };
    const mockResponse = { id: '1', name: 'Renamed List' };
    mockApi.patch.mockReturnValue(of(mockResponse));

    service.updateList('1', updateData).subscribe((result) => {
      expect(result).toEqual(mockResponse);
    });

    expect(mockApi.patch).toHaveBeenCalledWith('/lists/1', updateData);
  });

  it('deleteList should call api.delete("/lists/id")', () => {
    mockApi.delete.mockReturnValue(of(undefined));

    service.deleteList('1').subscribe();

    expect(mockApi.delete).toHaveBeenCalledWith('/lists/1');
  });

  it('acceptInvite should call api.post("/invites/token/accept")', () => {
    const mockResponse = {
      message: 'Accepted',
      listId: 'list1',
      listName: 'Shared List',
    };
    mockApi.post.mockReturnValue(of(mockResponse));

    service.acceptInvite('invite-token-xyz').subscribe((result) => {
      expect(result).toEqual(mockResponse);
    });

    expect(mockApi.post).toHaveBeenCalledWith('/invites/invite-token-xyz/accept-by-token');
  });
});
