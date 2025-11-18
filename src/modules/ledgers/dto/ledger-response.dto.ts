import { CollaborationResponseDto } from 'src/modules/collaborations/dto/collaboration-response.dto';
import { CreaditCardResponseDto } from 'src/modules/credit-cards/dto/credit-card-response.dto';
import { GroupResponseDto } from 'src/modules/groups/dto/group-response.dto';
import { TransactionResponseDto } from 'src/modules/transactions/dto/transaction-response.dto';

export class LedgerResponseDto {
  id: number;
  name: string;
  description: string | null;
  ownerId: string;
  collaborations: CollaborationResponseDto[];
  groups: GroupResponseDto[];
  transactions: TransactionResponseDto[];
  creditCards: CreaditCardResponseDto[];

  constructor(partial: Partial<LedgerResponseDto>) {
    Object.assign(this, partial);
  }
}
