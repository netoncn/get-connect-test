import { Component, input, output, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookAutocompleteComponent } from './book-autocomplete.component';
import { Suggestion } from '../../../core/models/catalog.model';
import { ItemKind, BookMetadata } from '../../../core/models/item.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

export interface ItemFormData {
  kind: ItemKind;
  title: string;
  notes?: string;
  metadata?: BookMetadata;
}

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, FormsModule, BookAutocompleteComponent, TranslatePipe],
  templateUrl: './item-form.component.html',
})
export class ItemFormComponent {
  @ViewChild(BookAutocompleteComponent) autocomplete?: BookAutocompleteComponent;

  loading = input(false);
  addItem = output<ItemFormData>();

  readonly selectedSuggestion = signal<Suggestion | null>(null);
  notes = '';

  onSuggestionSelect(suggestion: Suggestion): void {
    this.selectedSuggestion.set(suggestion);
  }

  clearSelection(): void {
    this.selectedSuggestion.set(null);
    this.notes = '';
    this.autocomplete?.clear();
  }

  onSubmit(): void {
    const suggestion = this.selectedSuggestion();
    if (!suggestion) return;

    const data: ItemFormData = {
      kind: suggestion.kind,
      title: suggestion.title,
      notes: this.notes || undefined,
    };

    if (suggestion.kind === 'BOOK') {
      data.metadata = {
        source: suggestion.source,
        sourceId: suggestion.sourceId,
        authors: suggestion.authors,
        isbn: suggestion.isbn,
        coverUrl: suggestion.coverUrl,
      };
    }

    this.addItem.emit(data);
    this.clearSelection();
  }
}
