import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateListDto {
  @ApiProperty({ example: 'My Reading List' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
