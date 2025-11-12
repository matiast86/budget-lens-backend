import { ApiProperty } from '@nestjs/swagger';
import { Gender, User } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user.',
    example: 'c5f5b510-6bbd-4a3d-b4b2-30f67d5c9133',
  })
  id: string;

  @ApiProperty({
    description: 'Full name of the user.',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Email address of the user.',
    example: 'johndoe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Date of birth of the user, formatted as an ISO string.',
    example: '1992-05-18T00:00:00.000Z',
  })
  birthDate: string;

  @ApiProperty({
    enum: Gender,
    description: 'Gender of the user.',
    example: Gender.MALE,
  })
  gender: Gender;

  @ApiProperty({
    description: 'Ledgers owned by the user.',
    type: [Object],
    example: [],
  })
  ledgers: object[];

  @ApiProperty({
    description: 'Collaborations the user participates in.',
    type: [Object],
    example: [],
  })
  collaborations: object[];

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.birthDate = user.birthDate.toISOString();
    this.gender = user.gender;
    this.ledgers = [];
    this.collaborations = [];
  }
}
