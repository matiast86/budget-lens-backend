import { ApiProperty } from '@nestjs/swagger';
import { CreditBrand } from 'generated/prisma/enums';
import { LedgerEntity } from 'src/modules/ledgers/entities/ledger.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { CreditCardWithRelations } from 'src/types/entities/entities-with-relations';

export class CreditCardEntity {
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

  @ApiProperty({
    type: () => UserEntity,
    description: 'User who registered this credit card.',
  })
  user: UserEntity;

  @ApiProperty({
    type: () => LedgerEntity,
    isArray: true,
    description: 'Ledgers where this credit card is used for transactions.',
    required: false,
  })
  ledgers: LedgerEntity[];

  constructor(creditCard: CreditCardWithRelations | CreditCardEntity) {
    this.id = creditCard.id;
    this.name = creditCard.name;
    this.userId = creditCard.userId;
    this.user = new UserEntity(creditCard.user as any);
    this.ledgers = creditCard.ledgers
      ? creditCard.ledgers.map((l) => new LedgerEntity(l))
      : [];
  }
}
