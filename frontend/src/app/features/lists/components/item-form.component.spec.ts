import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ItemFormComponent } from './item-form.component';
import { I18nService } from '../../../core/services/i18n.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { Suggestion } from '../../../core/models/catalog.model';
import { of } from 'rxjs';

const mockI18n = {
  t: vi.fn((key: string) => key),
  language: vi.fn().mockReturnValue('en'),
  loaded: vi.fn().mockReturnValue(true),
  languages: [{ code: 'en', name: 'English' }],
  init: vi.fn(),
  setLanguage: vi.fn(),
};

const mockCatalogService = {
  suggest: vi.fn().mockReturnValue(of({ suggestions: [] })),
};

const otherSuggestion: Suggestion = {
  kind: 'OTHER',
  title: 'My Custom Item',
};

describe('ItemFormComponent', () => {
  let component: ItemFormComponent;
  let fixture: ComponentFixture<ItemFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemFormComponent],
      providers: [
        { provide: I18nService, useValue: mockI18n },
        { provide: CatalogService, useValue: mockCatalogService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onSuggestionSelect should set selectedSuggestion', () => {
    expect(component.selectedSuggestion()).toBeNull();

    component.onSuggestionSelect(otherSuggestion);

    expect(component.selectedSuggestion()).toEqual(otherSuggestion);
  });

  it('onSubmit should emit addItem for OTHER suggestion', () => {
    const emitSpy = vi.fn();
    component.addItem.subscribe(emitSpy);

    component.onSuggestionSelect(otherSuggestion);
    component.notes = 'Some notes';
    component.onSubmit();

    expect(emitSpy).toHaveBeenCalledWith({
      kind: 'OTHER',
      title: 'My Custom Item',
      notes: 'Some notes',
    });

    expect(component.selectedSuggestion()).toBeNull();
    expect(component.notes).toBe('');
  });
});
