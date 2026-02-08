import { IsEmail, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInviteDto {
  @ApiProperty({ example: 'friend@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ enum: ['EDITOR', 'VIEWER'], default: 'VIEWER' })
  @IsOptional()
  @IsIn(['EDITOR', 'VIEWER'])
  role?: 'EDITOR' | 'VIEWER';
}
