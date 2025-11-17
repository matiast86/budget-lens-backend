import { ApiProperty } from '@nestjs/swagger';
import { PaymentType } from 'generated/prisma/enums';

export class PaymentMethodEntity {
  @ApiProperty({
    description: 'Unique numeric ID of the payment method.',
    example: 9,
  })
  id: number;

  @ApiProperty({
    description: 'Human-readable name of the payment method.',
    example: 'Bank Transfer',
  })
  name: string;

  @ApiProperty({
    enum: PaymentType,
    description: 'Defines the type of payment method.',
    example: PaymentType.OTHER,
  })
  type: PaymentType;

  constructor(paymentMethod: PaymentMethodEntity) {
    this.id = paymentMethod.id;
    this.name = paymentMethod.name;
    this.type = paymentMethod.type;
  }
}
