import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ItemKind } from '@prisma/client';

export class BookMetadataDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sourceId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsString({ each: true })
  authors?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  isbn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverUrl?: string;
}

export class CreateItemDto {
  @ApiProperty({ enum: ItemKind })
  @IsEnum(ItemKind)
  kind: ItemKind;

  @ApiProperty({ example: 'The Great Gatsby' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Must read this summer' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: BookMetadataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BookMetadataDto)
  metadata?: BookMetadataDto;
}
