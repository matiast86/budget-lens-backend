import { ApiProperty } from '@nestjs/swagger';

export class InflationIndexResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the inflation index record.',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Ledger ID this inflation index belongs to.',
    example: 101,
  })
  ledgerId: number;

  @ApiProperty({
    description: 'The month this inflation data represents (ISO 8601).',
    example: '2026-02-01T00:00:00.000Z',
  })
  period: string;

  @ApiProperty({
    description: 'Monthly inflation rate as a decimal.',
    example: 0.02,
  })
  monthlyRate: number;

  @ApiProperty({
    description: 'Cumulative CPI with base 100 = January 2024.',
    example: 550.0,
  })
  cpiIndex: number;

  @ApiProperty({
    description: 'Timestamp when the record was created (ISO 8601).',
    example: '2026-02-07T10:30:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Timestamp when the record was last updated (ISO 8601).',
    example: '2026-02-07T10:30:00.000Z',
  })
  updatedAt: string;

  constructor(partial: Partial<InflationIndexResponseDto>) {
    Object.assign(this, partial);
  }
}
