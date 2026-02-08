import { ItemKind } from '@prisma/client';
import { CatalogService } from './catalog.service';
import { OpenLibraryProvider } from './providers/open-library.provider';
import { SuggestionDto } from './dto';

describe('CatalogService', () => {
  let service: CatalogService;
  let openLibrary: { search: jest.Mock };

  beforeEach(() => {
    openLibrary = { search: jest.fn() };
    service = new CatalogService(openLibrary as unknown as OpenLibraryProvider);
  });

  describe('suggest', () => {
    it('should return OTHER + book suggestions', async () => {
      const bookSuggestions: SuggestionDto[] = [
        { kind: ItemKind.BOOK, title: 'Clean Code', source: 'OPEN_LIBRARY', sourceId: '/works/OL1' },
        { kind: ItemKind.BOOK, title: 'Clean Architecture', source: 'OPEN_LIBRARY', sourceId: '/works/OL2' },
      ];
      openLibrary.search.mockResolvedValue(bookSuggestions);

      const result = await service.suggest('Clean');

      expect(result.suggestions).toHaveLength(3);
      expect(result.suggestions[0]).toEqual({ kind: ItemKind.OTHER, title: 'Clean' });
      expect(result.suggestions[1]).toEqual(bookSuggestions[0]);
      expect(result.suggestions[2]).toEqual(bookSuggestions[1]);
    });

    it('should return empty for blank query', async () => {
      const result = await service.suggest('');

      expect(result).toEqual({ suggestions: [] });
      expect(openLibrary.search).not.toHaveBeenCalled();
    });

    it('should return empty for whitespace-only query', async () => {
      const result = await service.suggest('   ');

      expect(result).toEqual({ suggestions: [] });
      expect(openLibrary.search).not.toHaveBeenCalled();
    });

    it('should trim the query before using it', async () => {
      openLibrary.search.mockResolvedValue([]);

      const result = await service.suggest('  hello world  ');

      expect(openLibrary.search).toHaveBeenCalledWith('hello world');
      expect(result.suggestions[0]).toEqual({ kind: ItemKind.OTHER, title: 'hello world' });
    });
  });
});
