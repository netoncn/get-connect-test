import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ListRole } from '@prisma/client';

export class InviteResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  listId: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: ListRole })
  role: ListRole;

  @ApiProperty()
  expiresAt: Date;

  @ApiPropertyOptional()
  acceptedAt?: Date;

  @ApiProperty()
  createdAt: Date;
}

export class AcceptInviteResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  listId: string;

  @ApiProperty()
  listName: string;
}
