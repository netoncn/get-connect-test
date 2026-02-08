import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { SuggestionsResponseDto } from './dto';

@ApiTags('catalog')
@ApiBearerAuth()
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('suggest')
  @ApiOperation({ summary: 'Search books and get suggestions' })
  @ApiQuery({ name: 'query', description: 'Search query', required: true })
  @ApiResponse({ status: 200, type: SuggestionsResponseDto })
  async suggest(
    @Query('query') query: string,
  ): Promise<SuggestionsResponseDto> {
    return this.catalogService.suggest(query || '');
  }
}
