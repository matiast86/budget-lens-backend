import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Currency } from 'prisma/generated/prisma/enums';

export class LedgerDashboardResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Home Budget 2025' })
  name: string;

  @ApiPropertyOptional({
    example: 'Tracks monthly family expenses and shared utilities.',
  })
  description?: string;

  currency: Currency

  @ApiProperty({
    description: 'ISO date string when the ledger was created',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'ISO date string when the ledger was last updated',
    example: '2024-01-02T00:00:00.000Z',
  })
  updatedAt: string;

  constructor(partial: Partial<LedgerDashboardResponseDto>) {
    Object.assign(this, partial);
  }
}
