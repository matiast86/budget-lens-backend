import { Injectable } from '@nestjs/common';
import { DataCollectionService } from 'src/services/data-collection/data-collection.service';
import { LedgersService } from '../ledgers/ledgers.service';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly dataCollection: DataCollectionService,
    private readonly ledgersService: LedgersService,
    private readonly transactionsService: TransactionsService,
  ) {}
}
