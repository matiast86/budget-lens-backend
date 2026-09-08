import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

// Bundle parameters only apply when `transactionTypeEntry === FIXED` (create
// flows) or on the projection flow. All fields are optional so plain VARIABLE
// creates through the same endpoint are not forced to send them; the service
// validates presence of `bundleTo` when the FIXED / projection path is taken.
export class FixedBundleDto {
  @ApiPropertyOptional({
    description:
      'End period of the bundle (YYYY-MM, inclusive). Required whenever the FIXED / projection path is taken.',
    example: '2027-06',
  })
  @IsOptional()
  @IsDateString()
  bundleTo?: string;

  @ApiPropertyOptional({
    description:
      'Ongoing escalation applied every `increaseEveryMonths` steps, as a fraction (0.1 = +10% per step). Month 0 stays at the base amount.',
    example: 0.1,
    minimum: 0,
    maximum: 5,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  increaseRate?: number;

  @ApiPropertyOptional({
    description:
      'One-off catch-up bump applied to the seed amount at the start of a projection, as a fraction (0.1 = +10%). Independent of `increaseRate`; leave at 0 for "first projected month equals the frontier month".',
    example: 0.05,
    minimum: 0,
    maximum: 5,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  seedIncreaseRate?: number;

  @ApiPropertyOptional({
    description:
      'Number of months between each `increaseRate` step. 1 escalates every month.',
    example: 3,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  increaseEveryMonths?: number;

  constructor(partial: Partial<FixedBundleDto>) {
    Object.assign(this, partial);
  }
}
