import { ItemKind } from '@prisma/client';
import { OpenLibraryProvider } from './open-library.provider';
import { SuggestionDto } from '../dto';

describe('OpenLibraryProvider', () => {
  let provider: OpenLibraryProvider;

  beforeEach(() => {
    provider = new OpenLibraryProvider();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('search', () => {
    it('should call fetch with correct URL params', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ docs: [] }),
      });

      await provider.search('clean code', 5);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const calledUrl = new URL((global.fetch as jest.Mock).mock.calls[0][0]);
      expect(calledUrl.origin + calledUrl.pathname).toBe('https://openlibrary.org/search.json');
      expect(calledUrl.searchParams.get('q')).toBe('clean code');
      expect(calledUrl.searchParams.get('limit')).toBe('5');
      expect(calledUrl.searchParams.get('fields')).toBe('key,title,author_name,cover_i,isbn');
    });

    it('should return normalized suggestions', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          docs: [
            { key: '/works/OL1', title: 'Clean Code' },
            { key: '/works/OL2', title: 'The Pragmatic Programmer' },
          ],
        }),
      });

      const result = await provider.search('programming');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        kind: ItemKind.BOOK,
        title: 'Clean Code',
        source: 'OPEN_LIBRARY',
        sourceId: '/works/OL1',
      });
      expect(result[1]).toEqual({
        kind: ItemKind.BOOK,
        title: 'The Pragmatic Programmer',
        source: 'OPEN_LIBRARY',
        sourceId: '/works/OL2',
      });
    });

    it('should return empty array on non-ok response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await provider.search('anything');

      expect(result).toEqual([]);
    });

    it('should return empty array when fetch throws', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await provider.search('anything');

      expect(result).toEqual([]);
    });

    it('should map all doc fields correctly including optional ones', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          docs: [
            {
              key: '/works/OL12345',
              title: 'Clean Code',
              author_name: ['Robert C. Martin', 'Uncle Bob'],
              cover_i: 8091016,
              isbn: ['9780132350884', '0132350882'],
            },
          ],
        }),
      });

      const result = await provider.search('clean code');

      expect(result).toHaveLength(1);
      const suggestion: SuggestionDto = result[0];
      expect(suggestion.kind).toBe(ItemKind.BOOK);
      expect(suggestion.title).toBe('Clean Code');
      expect(suggestion.source).toBe('OPEN_LIBRARY');
      expect(suggestion.sourceId).toBe('/works/OL12345');
      expect(suggestion.authors).toEqual(['Robert C. Martin', 'Uncle Bob']);
      expect(suggestion.coverUrl).toBe('https://covers.openlibrary.org/b/id/8091016-M.jpg');
      expect(suggestion.isbn).toBe('9780132350884');
    });
  });
});
