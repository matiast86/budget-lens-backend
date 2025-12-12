import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCollaborationDto {
  @ApiProperty({
    description:
      'Automatically assigned collaboration name; not required on create.',
    example: 'User Name - Household budget partners',
    required: false,
    readOnly: true,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  constructor(partial: Partial<CreateCollaborationDto>) {
    Object.assign(this, partial);
  }
}
