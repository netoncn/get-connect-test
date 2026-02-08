import { ApiProperty } from '@nestjs/swagger';
import { ListRole } from '@prisma/client';

export class ListMemberResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  userEmail: string;

  @ApiProperty({ enum: ListRole })
  role: ListRole;

  @ApiProperty()
  createdAt: Date;
}

export class ListResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdById: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ enum: ListRole })
  userRole: ListRole;

  @ApiProperty()
  itemCount: number;

  @ApiProperty()
  memberCount: number;
}

export class ListDetailResponseDto extends ListResponseDto {
  @ApiProperty({ type: [ListMemberResponseDto] })
  members: ListMemberResponseDto[];
}
