import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { DebtDirection } from 'prisma/generated/prisma/client';

export class CreateDebtDto {
  @ApiProperty({
    description: 'ID of the transaction that originated the debt.',
    example: 550,
  })
  @IsInt()
  transactionId: number;

  @ApiProperty({ enum: DebtDirection })
  @IsEnum(DebtDirection)
  direction: DebtDirection;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: '2025-07',
    description: 'Period (YYYY-MM) when this debt should be recorded',
  })
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'month must be YYYY-MM' })
  periodString: string;

  @IsOptional()
  @IsString()
  description?: string;
}
