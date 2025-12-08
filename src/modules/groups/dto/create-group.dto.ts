import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({
    description: 'Descriptive name of the group.',
    example: 'Groceries',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
