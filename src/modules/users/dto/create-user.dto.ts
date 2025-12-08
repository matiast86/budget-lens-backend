import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { Gender } from 'prisma/generated/prisma/client';

export class CreateUserDto {
  @ApiProperty({
    description: 'Name of the user.',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The email of the user.',
    example: 'johndoe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Date of birth of the user in ISO 8601 format.',
    example: '1992-05-18T00:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDate()
  birthDate: Date;

  @ApiProperty({
    description:
      'User password: it must be at least 8 characters long, include one uppercase letter and one number.',
  })
  @Matches(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/, {
    message:
      'Password must be at least 8 characters long, include one uppercase letter and one number.',
  })
  rawPassword: string;
  @IsNotEmpty()
  repeatPassword: string;

  @ApiProperty({
    enum: Gender,
    description: 'Biological gender or personal identity of the user.',
    example: Gender.MALE,
  })
  @IsNotEmpty()
  gender: Gender;
}
