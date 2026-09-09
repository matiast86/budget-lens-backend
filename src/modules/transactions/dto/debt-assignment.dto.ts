import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { DebtDirection } from 'prisma/generated/prisma/enums';

// Each assignment records what one debt owner owes (or is owed) for a
// transaction. Provide exactly one of `amount` or `percentage`; the service
// throws `BadRequestException` when both are missing. If both are sent,
// `amount` wins and `percentage` is ignored.
export class DebtAssignmentDto {
  @ApiProperty({
    description: 'ID of the debt owner.',
    example: 15,
  })
  @IsInt()
  @Min(1)
  debtOwnerId: number;

  @ApiPropertyOptional({
    description:
      'Absolute debt amount assigned to this owner, in the transaction currency. ' +
      'Mutually exclusive with `percentage` (one is required); takes precedence if both are sent.',
    example: 12000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({
    description:
      "Owner's share of the transaction total, as a fraction (0.2 = 20%). " +
      'Used only when `amount` is omitted; the service resolves it to ' +
      '`transactionTotal * percentage`.',
    example: 0.2,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  percentage?: number;

  @ApiProperty({
    enum: DebtDirection,
    description: 'Whether the debt is owed to or by the user.',
    example: DebtDirection.OWED_TO_ME,
  })
  @IsEnum(DebtDirection)
  direction: DebtDirection;

  constructor(partial: Partial<DebtAssignmentDto>) {
    Object.assign(this, partial);
  }
}
