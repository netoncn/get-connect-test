import { ItemKind } from './item.model';

export interface Suggestion {
  kind: ItemKind;
  title: string;
  authors?: string[];
  source?: string;
  sourceId?: string;
  coverUrl?: string;
  isbn?: string;
}

export interface SuggestionsResponse {
  suggestions: Suggestion[];
}
