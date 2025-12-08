import { ApiProperty } from '@nestjs/swagger';

export class CollaborationResponseDto {
  @ApiProperty({
    description: 'Unique numeric ID of the collaboration record.',
    example: 45,
  })
  id: number;

  @ApiProperty({
    description: 'Human-friendly name for this collaboration entry.',
    example: 'User Name - Household budget partners',
  })
  name: string;

  @ApiProperty({
    description: 'Indicates whether the collaboration is active.',
    example: true,
    default: true,
  })
  isActive: boolean;

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
