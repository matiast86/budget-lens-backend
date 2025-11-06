import { ApiProperty } from '@nestjs/swagger';
import { Gender, Role } from 'generated/prisma/enums';
import { CollaborationEntity } from 'src/modules/collaborations/entities/collaboration.entity';
import { CreditCardEntity } from 'src/modules/credit-cards/entities/credit-card.entity';
import { GroupEntity } from 'src/modules/groups/entities/group.entity';
import { LedgerEntity } from 'src/modules/ledgers/entities/ledger.entity';

export class UserEntity {
  @ApiProperty({
    description:
      'Unique identifier (UUID) automatically generated for each user.',
    example: 'c5f5b510-6bbd-4a3d-b4b2-30f67d5c9133',
  })
  id: string;

  @ApiProperty({
    description: 'Full name of the user as displayed across the app.',
    example: 'Matías Tailler',
  })
  name: string;

  @ApiProperty({
    description:
      'Email address used for login and notifications. Must be unique.',
    example: 'matias.tailler@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Date of birth of the user in ISO 8601 format.',
    example: '1992-05-18T00:00:00.000Z',
  })
  birthDate: Date;

  @ApiProperty({
    description:
      'Hashed password of the user. This field is never returned in public responses.',
    example: '$2b$10$yqPM4xAzVfU/yD2HD/ABuuxqE92MvnZKYo38sGbPglnn34zA9/Rba',
  })
  password: string;

  @ApiProperty({
    enum: Gender,
    description: 'Biological gender or personal identity of the user.',
    example: Gender.MALE,
  })
  gender: Gender;

  @ApiProperty({
    enum: Role,
    description:
      'Defines the level of access and permissions the user has in the system.',
    example: Role.USER,
    default: Role.USER,
  })
  role: Role;

  @ApiProperty({
    type: () => LedgerEntity,
    isArray: true,
    description:
      'List of financial ledgers owned by this user. Each ledger represents a financial scope (e.g., household, project, shared wallet).',
    required: false,
  })
  ledgers: LedgerEntity[];

  @ApiProperty({
    type: () => CollaborationEntity,
    isArray: true,
    description:
      'Collaborations this user participates in — shared ledgers where they have limited access.',
    required: false,
  })
  collaborations: CollaborationEntity[];

  @ApiProperty({
    type: () => CreditCardEntity,
    isArray: true,
    description:
      'Credit cards registered by this user, which can be linked to one or more ledgers.',
    required: false,
  })
  creditCards: CreditCardEntity[];

  @ApiProperty({
    type: () => GroupEntity,
    isArray: true,
    description:
      'Groups defined by the user for organizing transactions (e.g., “Utilities”, “Groceries”).',
    required: false,
  })
  groups: GroupEntity[];

  @ApiProperty({
    description: 'Timestamp of when the user record was created.',
    example: '2025-01-01T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp of the last update made to this user record.',
    example: '2025-02-10T15:43:21.000Z',
  })
  updatedAt: Date;
}
