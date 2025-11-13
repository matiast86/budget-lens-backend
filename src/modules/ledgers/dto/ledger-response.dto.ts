import { Ledger } from '@prisma/client';

export class LedgerResponseDto {
  id: number;
  name: string;
  description: string | null;
  ownerId: string;
  collaborations: object[];
  groups: object[];
  transactions: object[];
  creditCards: object[];

  constructor(ledger: Ledger) {
    this.id = ledger.id;
    this.name = ledger.name;
    this.description = ledger.description;
    this.ownerId = ledger.ownerId;
    this.collaborations = [];
    this.groups = [];
    this.transactions = [];
    this.creditCards = [];
  }
}
