import { CollaborationResponseDto } from 'src/modules/collaborations/dto/collaboration-response.dto';
import { GroupResponseDto } from 'src/modules/groups/dto/group-response.dto';
import { PaymentMethodResponseDto } from 'src/modules/payment-methods/dto/payment-method-response.dto';
import { TransactionResponseDto } from 'src/modules/transactions/dto/transaction-response.dto';

export class LedgerResponseDto {
  id: number;
  name: string;
  description?: string;
  ownerId: string;
  collaborations: CollaborationResponseDto[];
  groups: GroupResponseDto[];
  transactions: TransactionResponseDto[];
  paymentMethods: PaymentMethodResponseDto[];
  createdAt: string;
  updatedAt: string;

  constructor(partial: Partial<LedgerResponseDto>) {
    Object.assign(this, partial);
  }
}
