import { ApiProperty } from '@nestjs/swagger';
import { DebtResponseDto } from 'src/modules/debts/dto/debt-response.dto';

export class DebtOwnerResponseDto {
  @ApiProperty({
    description: 'Unique numeric ID of the debt owner.',
    example: 15,
  })
  id: number;

  @ApiProperty({
    description: 'Name identifying the person or entity associated with debts.',
    example: 'Ana Pérez',
  })
  name: string;
  ledgerId: string;
  debts: DebtResponseDto[];
  constructor(partial: Partial<DebtOwnerResponseDto>) {
    Object.assign(this, partial);
  }
}
