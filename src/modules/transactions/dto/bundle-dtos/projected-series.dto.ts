import { ApiProperty } from '@nestjs/swagger';
import { TransactionResponseDto } from '../transaction-response.dto';

// One entry per FIXED line extended forward by `projectFixedExpensesForward`.
export class ProjectedSeriesDto {
  @ApiProperty({
    description:
      'ID of the frontier transaction this series was extended from (the template row).',
    example: 412,
  })
  sourceId: number;

  @ApiProperty({
    description:
      'Payment month of the frontier transaction used as the template.',
    example: '2026-12-01T00:00:00.000Z',
  })
  sourceMonth: Date;

  @ApiProperty({
    type: TransactionResponseDto,
    isArray: true,
    description:
      'The generated transactions, one per month from the frontier + 1 through `bundleTo` inclusive.',
  })
  projected: TransactionResponseDto[];

  constructor(partial: Partial<ProjectedSeriesDto>) {
    Object.assign(this, partial);
  }
}
