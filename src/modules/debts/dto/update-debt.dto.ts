import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { DebtDirection } from 'prisma/generated/prisma/client';

export class UpdateDebtDto {
  @ApiPropertyOptional({ enum: DebtDirection })
  @IsOptional()
  @IsEnum(DebtDirection)
  direction?: DebtDirection;

  @ApiPropertyOptional({ example: 15000 })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({
    example: '2025-07',
    description: 'Period (YYYY-MM) when this debt should be recorded',
  })
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'month must be YYYY-MM' })
  periodString?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
