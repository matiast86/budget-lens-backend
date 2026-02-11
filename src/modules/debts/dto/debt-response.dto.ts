import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DebtResponseDto {
  @ApiProperty({
    description: 'Unique numeric ID of the debt record.',
    example: 99,
  })
  id: number;

  @ApiProperty({
    description:
      'Month the debt corresponds to (used for monthly reconciliation).',
    example: '2025-03-01T00:00:00.000Z',
  })
  period: string;

  @ApiPropertyOptional({
    description: 'Optional description or note for this debt.',
    example: 'Celular Sofi - cuota 3/12',
  })
  description?: string;

  constructor(partial: Partial<DebtResponseDto>) {
    Object.assign(this, partial);
  }
}
