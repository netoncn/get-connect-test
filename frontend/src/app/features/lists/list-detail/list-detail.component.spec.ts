import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ListDetailComponent } from './list-detail.component';
import { ListsService } from '../../../core/services/lists.service';
import { ItemsService } from '../../../core/services/items.service';
import { I18nService } from '../../../core/services/i18n.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { of } from 'rxjs';
import { ListDetail } from '../../../core/models/list.model';
import { ListItem } from '../../../core/models/item.model';

const mockI18n = {
  t: vi.fn((key: string) => key),
  language: vi.fn().mockReturnValue('en'),
  loaded: vi.fn().mockReturnValue(true),
  languages: [{ code: 'en', name: 'English' }],
  init: vi.fn(),
  setLanguage: vi.fn(),
};

const mockCatalog = {
  suggest: vi.fn().mockReturnValue(of({ suggestions: [] })),
};

function createMockListDetail(role: 'OWNER' | 'EDITOR' | 'VIEWER'): ListDetail {
  return {
    id: 'list-1',
    name: 'Test List',
    createdById: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    userRole: role,
    itemCount: 1,
    memberCount: 1,
    members: [],
  };
}

const mockItem: ListItem = {
  id: 'item-1',
  listId: 'list-1',
  createdById: 'user-1',
  createdByName: 'Test User',
  kind: 'OTHER',
  title: 'Test Item',
  done: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ListDetailComponent', () => {
  let component: ListDetailComponent;
  let fixture: ComponentFixture<ListDetailComponent>;
  let mockListsService: any;
  let mockItemsService: any;
  let router: Router;

  beforeEach(async () => {
    mockListsService = {
      getList: vi.fn().mockReturnValue(of(createMockListDetail('OWNER'))),
      deleteList: vi.fn().mockReturnValue(of(undefined)),
      createInvite: vi.fn().mockReturnValue(of({})),
      updateMemberRole: vi.fn().mockReturnValue(of({})),
      removeMember: vi.fn().mockReturnValue(of(undefined)),
    };

    mockItemsService = {
      getItems: vi.fn().mockReturnValue(of([mockItem])),
      createItem: vi.fn().mockReturnValue(of(mockItem)),
      updateItem: vi.fn().mockReturnValue(of({ ...mockItem, done: true })),
      deleteItem: vi.fn().mockReturnValue(of(undefined)),
    };

    const mockRoute = {
      snapshot: { paramMap: { get: vi.fn().mockReturnValue('list-1') } },
    };

    await TestBed.configureTestingModule({
      imports: [ListDetailComponent],
      providers: [
        provideRouter([]),
        { provide: ListsService, useValue: mockListsService },
        { provide: ItemsService, useValue: mockItemsService },
        { provide: I18nService, useValue: mockI18n },
        { provide: CatalogService, useValue: mockCatalog },
        { provide: ActivatedRoute, useValue: mockRoute },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(ListDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load list and items on init', () => {
    expect(mockListsService.getList).toHaveBeenCalledWith('list-1');
    expect(mockItemsService.getItems).toHaveBeenCalledWith('list-1');
    expect(component.list()).toBeTruthy();
    expect(component.items().length).toBe(1);
  });

  it('isOwner should be true for OWNER', () => {
    expect(component.isOwner()).toBe(true);
  });

  it('canEdit should be true for EDITOR', () => {
    mockListsService.getList.mockReturnValue(of(createMockListDetail('EDITOR')));
    component.loadList();
    expect(component.canEdit()).toBe(true);
  });

  it('canEdit should be false for VIEWER', () => {
    mockListsService.getList.mockReturnValue(of(createMockListDetail('VIEWER')));
    component.loadList();
    expect(component.canEdit()).toBe(false);
  });

  it('onAddItem should call itemsService.createItem', () => {
    const formData = { kind: 'OTHER' as const, title: 'New Item' };
    component.onAddItem(formData);

    expect(mockItemsService.createItem).toHaveBeenCalledWith('list-1', formData);
  });

  it('onToggleDone should call itemsService.updateItem with toggled done', () => {
    component.onToggleDone(mockItem);

    expect(mockItemsService.updateItem).toHaveBeenCalledWith('list-1', 'item-1', {
      done: true,
    });
  });

  it('onDeleteList should call listsService.deleteList and navigate', () => {
    component.onDeleteList();

    expect(mockListsService.deleteList).toHaveBeenCalledWith('list-1');
    expect(router.navigate).toHaveBeenCalledWith(['/lists']);
  });
});
