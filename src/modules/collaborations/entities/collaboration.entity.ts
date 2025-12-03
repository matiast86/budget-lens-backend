import { ApiProperty } from '@nestjs/swagger';
import { CollaborationRole } from '@prisma/client';

import { LedgerEntity } from 'src/modules/ledgers/entities/ledger.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';

export class CollaborationEntity {
  @ApiProperty({
    description: 'Unique numeric ID of the collaboration record.',
    example: 45,
  })
  id: number;

  @ApiProperty({
    enum: CollaborationRole,
    description:
      'Defines the collaborator’s role in the shared ledger (e.g., ADMIN can edit, COLLABORATOR can view).',
    example: CollaborationRole.COLLABORATOR,
    default: CollaborationRole.COLLABORATOR,
  })
  role: CollaborationRole;

  @ApiProperty({
    description: 'UUID of the user participating in the collaboration.',
    example: 'c5f5b510-6bbd-4a3d-b4b2-30f67d5c9133',
  })
  userId: string;

  @ApiProperty({
    description: 'Numeric ID of the ledger this collaboration belongs to.',
    example: 101,
  })
  ledgerId: number;

  @ApiProperty({
    type: () => UserEntity,
    description: 'User who is participating in this collaboration.',
  })
  user: UserEntity;

  @ApiProperty({
    type: () => LedgerEntity,
    description: 'Ledger that this collaboration grants access to.',
  })
  ledger: LedgerEntity;

  constructor(partial: Partial<CollaborationEntity>) {
    Object.assign(this, partial);
  }
}
