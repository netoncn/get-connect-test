import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMemberDto {
  @ApiProperty({ enum: ['EDITOR', 'VIEWER'] })
  @IsIn(['EDITOR', 'VIEWER'])
  role: 'EDITOR' | 'VIEWER';
}
