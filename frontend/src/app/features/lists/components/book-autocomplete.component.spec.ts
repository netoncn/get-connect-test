import { TestBed, ComponentFixture } from '@angular/core/testing';
import { BookAutocompleteComponent } from './book-autocomplete.component';
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

const mockSuggestion: Suggestion = {
  kind: 'BOOK',
  title: 'Clean Code',
  authors: ['Robert C. Martin'],
  source: 'google',
  sourceId: 'abc123',
};

describe('BookAutocompleteComponent', () => {
  let component: BookAutocompleteComponent;
  let fixture: ComponentFixture<BookAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookAutocompleteComponent],
      providers: [
        { provide: I18nService, useValue: mockI18n },
        { provide: CatalogService, useValue: mockCatalogService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.searchText()).toBe('');
    expect(component.suggestions()).toEqual([]);
    expect(component.loading()).toBe(false);
    expect(component.showDropdown()).toBe(false);
  });

  it('onSelect should emit and clear state', () => {
    const emitSpy = vi.fn();
    component.selectSuggestion.subscribe(emitSpy);

    component.onSelect(mockSuggestion);

    expect(emitSpy).toHaveBeenCalledWith(mockSuggestion);
    expect(component.searchText()).toBe('');
    expect(component.suggestions()).toEqual([]);
    expect(component.showDropdown()).toBe(false);
  });

  it('clear should reset searchText and suggestions', () => {
    component.onSearchChange('test query');

    component.clear();

    expect(component.searchText()).toBe('');
    expect(component.suggestions()).toEqual([]);
  });
});
