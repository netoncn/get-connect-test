import { Component, input, output, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, takeUntil } from 'rxjs';
import { CatalogService } from '../../../core/services/catalog.service';
import { Suggestion } from '../../../core/models/catalog.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-book-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './book-autocomplete.component.html',
})
export class BookAutocompleteComponent implements OnDestroy {
  private readonly catalogService = inject(CatalogService);
  private readonly searchSubject = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  readonly searchText = signal('');
  readonly suggestions = signal<Suggestion[]>([]);
  readonly loading = signal(false);
  readonly showDropdown = signal(false);

  selectSuggestion = output<Suggestion>();

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query.trim()) {
            return of({ suggestions: [] });
          }
          this.loading.set(true);
          return this.catalogService.suggest(query);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          this.suggestions.set(response.suggestions);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(value: string): void {
    this.searchText.set(value);
    this.searchSubject.next(value);
  }

  onFocus(): void {
    this.showDropdown.set(true);
  }

  onBlur(): void {
    setTimeout(() => this.showDropdown.set(false), 200);
  }

  onSelect(suggestion: Suggestion): void {
    this.selectSuggestion.emit(suggestion);
    this.searchText.set('');
    this.suggestions.set([]);
    this.showDropdown.set(false);
  }

  clear(): void {
    this.searchText.set('');
    this.suggestions.set([]);
  }
}
