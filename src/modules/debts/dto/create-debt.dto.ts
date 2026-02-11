import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class CreateDebtDto {
  @ApiProperty({
    example: '2025-07',
    description: 'Period (YYYY-MM) when this debt should be recorded',
  })
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'month must be YYYY-MM' })
  periodString: string;

  @ApiPropertyOptional({
    description: 'Optional description or note for this debt.',
    example: 'Celular Sofi - cuota 3/12',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
