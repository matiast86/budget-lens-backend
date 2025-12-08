import { ApiProperty } from '@nestjs/swagger';
import { CollaborationRole } from 'prisma/generated/prisma/client';

export class CollaborationResponseDto {
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

  constructor(partial: Partial<CollaborationResponseDto>) {
    Object.assign(this, partial);
  }
}
