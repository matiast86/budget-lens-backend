import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

// Bundle parameters only apply when `transactionTypeEntry === FIXED`.
// All fields are optional so plain VARIABLE creates through the same
// endpoint are not forced to send them; the service validates presence
// of `bundleTo` when the FIXED path is taken.
export class FixedBundleDto {
  @IsOptional()
  @IsDateString()
  bundleTo?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  increaseRate?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  increaseEveryMonths?: number;

  constructor(partial: Partial<FixedBundleDto>) {
    Object.assign(this, partial);
  }
}
