import { ApiProperty } from '@nestjs/swagger';

export class GroupResponseDto {
  @ApiProperty({
    description: 'Unique numeric ID of the group.',
    example: 78,
  })
  id: number;

  @ApiProperty({
    description: 'Descriptive name of the group.',
    example: 'Groceries',
  })
  name: string;

  @ApiProperty({
    description: 'Optional reference to the ledger this group belongs to.',
    example: 101,
    required: false,
  })
  ledgerId?: number;

  @ApiProperty({
    description: 'UUID of the user who owns or created this group.',
    example: 'c5f5b510-6bbd-4a3d-b4b2-30f67d5c9133',
  })
  userId: string;

  @ApiProperty({
    description:
      'Indicates if this group is global (shared across ledgers) or specific to one ledger.',
    example: false,
    default: false,
  })
  isGlobal: boolean;

  constructor(partial: Partial<GroupResponseDto>) {
    Object.assign(this, partial);
  }
}
