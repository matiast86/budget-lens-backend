import { ApiProperty } from '@nestjs/swagger';
import { Gender, Role } from '@prisma/client';
import { CollaborationEntity } from 'src/modules/collaborations/entities/collaboration.entity';
import { CreditCardEntity } from 'src/modules/credit-cards/entities/credit-card.entity';
import { GroupEntity } from 'src/modules/groups/entities/group.entity';
import { LedgerEntity } from 'src/modules/ledgers/entities/ledger.entity';

export class UserEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  birthDate: Date;

  @ApiProperty()
  password: string;

  @ApiProperty({ enum: Gender })
  gender: Gender;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty({ type: () => LedgerEntity, isArray: true })
  ledgers: LedgerEntity[];

  @ApiProperty({ type: () => CollaborationEntity, isArray: true })
  collaborations: CollaborationEntity[];

  @ApiProperty({ type: () => CreditCardEntity, isArray: true })
  creditCards: CreditCardEntity[];

  @ApiProperty({ type: () => GroupEntity, isArray: true })
  groups: GroupEntity[];

  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
