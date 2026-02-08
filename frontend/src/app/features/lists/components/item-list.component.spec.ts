import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ItemListComponent } from './item-list.component';
import { I18nService } from '../../../core/services/i18n.service';
import { ListItem } from '../../../core/models/item.model';

const mockI18n = {
  t: vi.fn((key: string) => key),
  language: vi.fn().mockReturnValue('en'),
  loaded: vi.fn().mockReturnValue(true),
  languages: [{ code: 'en', name: 'English' }],
  init: vi.fn(),
  setLanguage: vi.fn(),
};

const mockItems: ListItem[] = [
  {
    id: 'i1',
    listId: 'l1',
    createdById: 'u1',
    createdByName: 'User',
    kind: 'OTHER',
    title: 'Test Item',
    done: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('ItemListComponent', () => {
  let component: ItemListComponent;
  let fixture: ComponentFixture<ItemListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemListComponent],
      providers: [{ provide: I18nService, useValue: mockI18n }],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
  });

  it('should create with inputs', () => {
    expect(component).toBeTruthy();
    expect(component.items()).toEqual(mockItems);
    expect(component.canEdit()).toBe(false);
  });

  it('should have output emitters defined', () => {
    expect(component.toggleDone).toBeDefined();
    expect(component.deleteItem).toBeDefined();
  });
});
