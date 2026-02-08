import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateListDto {
  @ApiProperty({ example: 'My Updated Reading List' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
