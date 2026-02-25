import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDebtOwnerDto {
  @ApiProperty({
    description: 'Name identifying the person or entity associated with debts.',
    example: 'Ana Pérez',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
  constructor(partial: Partial<CreateDebtOwnerDto>) {
    Object.assign(this, partial);
  }
}
