import { Injectable, Logger } from '@nestjs/common';
import { SuggestionDto } from '../dto';
import { ItemKind } from '@prisma/client';

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  isbn?: string[];
}

interface OpenLibraryResponse {
  docs: OpenLibraryDoc[];
}

@Injectable()
export class OpenLibraryProvider {
  private readonly logger = new Logger(OpenLibraryProvider.name);
  private readonly baseUrl = 'https://openlibrary.org/search.json';
  private readonly coverUrl = 'https://covers.openlibrary.org/b/id';

  async search(query: string, limit = 10): Promise<SuggestionDto[]> {
    try {
      const url = new URL(this.baseUrl);
      url.searchParams.set('q', query);
      url.searchParams.set('limit', String(limit));
      url.searchParams.set('fields', 'key,title,author_name,cover_i,isbn');

      const response = await fetch(url.toString());

      if (!response.ok) {
        this.logger.warn(`Open Library API returned ${response.status}`);
        return [];
      }

      const data = (await response.json()) as OpenLibraryResponse;

      return data.docs.map((doc) => this.normalize(doc));
    } catch (error) {
      this.logger.error('Failed to fetch from Open Library', error);
      return [];
    }
  }

  private normalize(doc: OpenLibraryDoc): SuggestionDto {
    const suggestion: SuggestionDto = {
      kind: ItemKind.BOOK,
      title: doc.title,
      source: 'OPEN_LIBRARY',
      sourceId: doc.key,
    };

    if (doc.author_name?.length) {
      suggestion.authors = doc.author_name;
    }

    if (doc.cover_i) {
      suggestion.coverUrl = `${this.coverUrl}/${doc.cover_i}-M.jpg`;
    }

    if (doc.isbn?.length) {
      suggestion.isbn = doc.isbn[0];
    }

    return suggestion;
  }
}
