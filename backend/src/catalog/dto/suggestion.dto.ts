import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ItemKind } from '@prisma/client';

export class SuggestionDto {
  @ApiProperty({ enum: ItemKind })
  kind: ItemKind;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional({ type: [String] })
  authors?: string[];

  @ApiPropertyOptional()
  source?: string;

  @ApiPropertyOptional()
  sourceId?: string;

  @ApiPropertyOptional()
  coverUrl?: string;

  @ApiPropertyOptional()
  isbn?: string;
}

export class SuggestionsResponseDto {
  @ApiProperty({ type: [SuggestionDto] })
  suggestions: SuggestionDto[];
}
