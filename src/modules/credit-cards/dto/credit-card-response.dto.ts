import { ApiProperty } from '@nestjs/swagger';
import { CreditBrand } from '@prisma/client';

export class CreditCardResponseDto {
  @ApiProperty({
    description: 'Unique numeric ID of the credit card record.',
    example: 12,
  })
  id: number;

  @ApiProperty({
    description: 'Name used to identify the credit card.',
    example: 'Visa Galicia Classic',
  })
  name: string;

  @ApiProperty({
    enum: CreditBrand,
    description: 'Card brand or network (e.g., Visa, Mastercard, Amex).',
    example: CreditBrand.VISA,
  })
  type: CreditBrand;

  @ApiProperty({
    description: 'UUID of the user that owns this credit card.',
    example: 'c5f5b510-6bbd-4a3d-b4b2-30f67d5c9133',
  })
  userId: string;

  constructor(partial: Partial<CreditCardResponseDto>) {
    Object.assign(this, partial);
  }
}
