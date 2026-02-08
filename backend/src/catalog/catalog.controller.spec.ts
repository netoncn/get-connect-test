import { Test, TestingModule } from '@nestjs/testing';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { SuggestionsResponseDto } from './dto';

describe('CatalogController', () => {
  let controller: CatalogController;
  let service: jest.Mocked<CatalogService>;

  beforeEach(async () => {
    const mockService = {
      suggest: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [{ provide: CatalogService, useValue: mockService }],
    }).compile();

    controller = module.get<CatalogController>(CatalogController);
    service = module.get(CatalogService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('suggest', () => {
    it('should delegate to catalogService.suggest with the provided query', async () => {
      const query = 'Harry Potter';
      const expected: SuggestionsResponseDto = {
        suggestions: [
          {
            title: 'Harry Potter and the Philosopher\'s Stone',
            author: 'J.K. Rowling',
          },
        ],
      } as unknown as SuggestionsResponseDto;

      service.suggest.mockResolvedValue(expected);

      const result = await controller.suggest(query);

      expect(result).toEqual(expected);
      expect(service.suggest).toHaveBeenCalledWith(query);
      expect(service.suggest).toHaveBeenCalledTimes(1);
    });

    it('should pass empty string to catalogService.suggest when query is undefined', async () => {
      const expected: SuggestionsResponseDto = {
        suggestions: [],
      } as SuggestionsResponseDto;

      service.suggest.mockResolvedValue(expected);

      const result = await controller.suggest(undefined as unknown as string);

      expect(result).toEqual(expected);
      expect(service.suggest).toHaveBeenCalledWith('');
      expect(service.suggest).toHaveBeenCalledTimes(1);
    });
  });
});
