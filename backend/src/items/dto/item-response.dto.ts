import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ItemKind } from '@prisma/client';

export class ItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  listId: string;

  @ApiProperty()
  createdById: string;

  @ApiProperty()
  createdByName: string;

  @ApiProperty({ enum: ItemKind })
  kind: ItemKind;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  done: boolean;

  @ApiPropertyOptional()
  metadata?: Record<string, unknown>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
