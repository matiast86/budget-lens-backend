import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Currency } from 'prisma/generated/prisma/enums';
import { FixedBundleDto } from './fixed-bundle.dto';

// Body of `POST transactions/ledgers/:ledgerId/projections`.
// The projection frontier (the last already-planned month) is derived
// server-side from the group's FIXED rows, not passed in.
export class ProjectionsDto {
  @ApiProperty({
    description:
      'ID of the category whose FIXED lines will be projected forward.',
    example: 3,
  })
  @IsInt()
  @Min(1)
  categoryId: number;

  @ApiProperty({
    description: 'ID of the group whose FIXED lines will be projected forward.',
    example: 78,
  })
  @IsInt()
  @Min(1)
  groupId: number;

  @ApiProperty({
    description:
      'Fallback payment method for projected rows whose source transaction has none; each row otherwise inherits its source payment method.',
    example: 2,
  })
  @IsInt()
  @Min(1)
  paymentMethodId: number;

  @ApiProperty({
    enum: Currency,
    description: 'Currency of the FIXED lines to project.',
    example: Currency.ARS,
  })
  @IsEnum(Currency)
  currency: Currency;

  @ApiPropertyOptional({
    description:
      'Comment applied to every projected row; falls back to the source transaction comment when omitted.',
    example: 'Projected 2027 H1 fixed costs',
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({
    description:
      'Exchange rate used when `currency` differs from the ledger currency.',
    example: 950.5,
  })
  @IsOptional()
  @IsNumber()
  exchangeRate?: number;

  @ApiProperty({
    type: FixedBundleDto,
    description:
      'Projection horizon and escalation. `bundleTo` (YYYY-MM, inclusive) is required and must not precede the derived frontier; `increaseRate` / `increaseEveryMonths` / `seedIncreaseRate` apply group-wide to every projected line.',
  })
  @ValidateNested()
  @Type(() => FixedBundleDto)
  fixedBundleDto: FixedBundleDto;

  constructor(partial: Partial<ProjectionsDto>) {
    Object.assign(this, partial);
  }
}
