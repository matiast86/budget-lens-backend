import { ApiProperty } from '@nestjs/swagger';
import { Gender, Role } from 'prisma/generated/prisma/client';

export class UserResponseDto {
  @ApiProperty({ example: 'c5f5b510-6bbd-4a3d-b4b2-30f67d5c9133' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'johndoe@example.com' })
  email: string;

  @ApiProperty({
    description: 'Date of birth (ISO string).',
    example: '1992-05-18T00:00:00.000Z',
  })
  birthDate: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  gender: Gender;

  @ApiProperty({
    enum: Role,
    description: 'Defines user permissions.',
    example: Role.USER,
  })
  role: Role;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z' })
  updatedAt: string;

  isActive: boolean;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
