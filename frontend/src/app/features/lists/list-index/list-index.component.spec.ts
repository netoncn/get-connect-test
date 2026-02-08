import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ListIndexComponent } from './list-index.component';
import { ListsService } from '../../../core/services/lists.service';
import { I18nService } from '../../../core/services/i18n.service';
import { of } from 'rxjs';
import { List } from '../../../core/models/list.model';

const mockI18n = {
  t: vi.fn((key: string) => key),
  language: vi.fn().mockReturnValue('en'),
  loaded: vi.fn().mockReturnValue(true),
  languages: [{ code: 'en', name: 'English' }],
  init: vi.fn(),
  setLanguage: vi.fn(),
};

const mockList: List = {
  id: 'list-1',
  name: 'New List',
  createdById: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  userRole: 'OWNER',
  itemCount: 0,
  memberCount: 1,
};

describe('ListIndexComponent', () => {
  let component: ListIndexComponent;
  let fixture: ComponentFixture<ListIndexComponent>;
  let mockListsService: any;

  beforeEach(async () => {
    mockListsService = {
      getLists: vi.fn().mockReturnValue(of([])),
      createList: vi.fn().mockReturnValue(of(mockList)),
      getPendingInvites: vi.fn().mockReturnValue(of([])),
    };

    await TestBed.configureTestingModule({
      imports: [ListIndexComponent],
      providers: [
        { provide: ListsService, useValue: mockListsService },
        { provide: I18nService, useValue: mockI18n },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load lists on init', () => {
    expect(mockListsService.getLists).toHaveBeenCalled();
  });

  it('should set loading false after load', () => {
    expect(component.loading()).toBe(false);
  });

  it('onCreate should call createList and add to lists', () => {
    component.createForm.setValue({ name: 'New List' });
    component.onCreate();

    expect(mockListsService.createList).toHaveBeenCalledWith({ name: 'New List' });
    expect(component.lists()).toEqual([mockList]);
    expect(component.showCreateModal()).toBe(false);
  });

  it('closeModal should reset form', () => {
    component.createForm.setValue({ name: 'Something' });
    component.showCreateModal.set(true);

    component.closeModal();

    expect(component.showCreateModal()).toBe(false);
    expect(component.createForm.value.name).toBe('');
  });
});
