import { Injectable } from '@nestjs/common';
import { ItemKind } from '@prisma/client';
import { OpenLibraryProvider } from './providers/open-library.provider';
import { SuggestionDto, SuggestionsResponseDto } from './dto';

@Injectable()
export class CatalogService {
  constructor(private readonly openLibrary: OpenLibraryProvider) {}

  async suggest(query: string): Promise<SuggestionsResponseDto> {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return { suggestions: [] };
    }

    const otherSuggestion: SuggestionDto = {
      kind: ItemKind.OTHER,
      title: trimmedQuery,
    };

    const bookSuggestions = await this.openLibrary.search(trimmedQuery);

    return {
      suggestions: [otherSuggestion, ...bookSuggestions],
    };
  }
}
