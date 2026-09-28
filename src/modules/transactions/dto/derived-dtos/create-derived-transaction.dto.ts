import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNumber,
  Max,
  Min,
} from 'class-validator';
import { FixedBundleDto } from '../bundle-dtos/fixed-bundle.dto';
import { CreateTransactionDto } from '../create-transaction.dto';

// A derived transaction's amount is computed server-side as
// `derivationRate * sum(source transactions' totalAmount)` — the inherited
// `totalProvidedAmount` is ignored on this path.
export class CreateDerivedTransactionDto extends IntersectionType(
  CreateTransactionDto,
  FixedBundleDto,
) {
  @ApiProperty({
    description:
      'IDs of the transactions this amount is derived from. Their totalAmount ' +
      'is summed and multiplied by `derivationRate`.',
    example: [1024, 1031],
    type: [Number],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  sourceTransactionIds: number[];

  @ApiProperty({
    description:
      'Share of the summed source transactions applied to this amount, as a ' +
      'fraction (0.21 = 21%).',
    example: 0.21,
    minimum: 0,
    maximum: 1,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  derivationRate: number;
}
