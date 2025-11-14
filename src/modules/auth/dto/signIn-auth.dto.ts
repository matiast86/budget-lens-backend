import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  Matches,
} from 'class-validator';

export class SignInAuthDto {
  @ApiProperty({
    description: 'The email of the user.',
    example: 'johndoe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
    required: true,
    description: 'The password of the user',
    example: 'Alice1234$',
  })
  @IsNotEmpty()
  @IsStrongPassword({
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @Matches(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/, {
    message:
      'Password must be at least 8 characters long, include one uppercase letter and one number.',
  })
  @IsNotEmpty()
  password: string;
}
