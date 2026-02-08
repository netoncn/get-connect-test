import { ApiProperty } from '@nestjs/swagger';
import { ListRole } from '@prisma/client';

export class PendingInviteDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  listId: string;

  @ApiProperty()
  listName: string;

  @ApiProperty()
  listItemCount: number;

  @ApiProperty()
  listMemberCount: number;

  @ApiProperty({ enum: ListRole })
  role: ListRole;

  @ApiProperty()
  invitedBy: string;

  @ApiProperty()
  expiresAt: Date;
}
