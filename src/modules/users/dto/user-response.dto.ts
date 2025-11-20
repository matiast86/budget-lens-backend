import { ApiProperty } from '@nestjs/swagger';
import { Gender, Role } from '@prisma/client';
import { CollaborationResponseDto } from 'src/modules/collaborations/dto/collaboration-response.dto';
import { CreditCardResponseDto } from 'src/modules/credit-cards/dto/credit-card-response.dto';
import { GroupResponseDto } from 'src/modules/groups/dto/group-response.dto';
import { LedgerResponseDto } from 'src/modules/ledgers/dto/ledger-response.dto';

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

  @ApiProperty({
    type: () => LedgerResponseDto,
    isArray: true,
    description: 'Ledgers owned by the user.',
  })
  ledgers: LedgerResponseDto[];

  @ApiProperty({
    type: () => CollaborationResponseDto,
    isArray: true,
    description: 'Collaborations of the user.',
  })
  collaborations: CollaborationResponseDto[];

  @ApiProperty({
    type: () => CreditCardResponseDto,
    isArray: true,
    description: 'Credit Cards of the user.',
  })
  creditCards: CreditCardResponseDto[];

  @ApiProperty({
    type: () => GroupResponseDto,
    isArray: true,
    description: 'Groups of the user.',
  })
  groups: GroupResponseDto[];

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
