import { ApiProperty } from '@nestjs/swagger';
import { DebtDirection } from '@prisma/client';
import { IsEnum, IsNumber, Matches } from 'class-validator';

export class CreateDebtDto {
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
}
