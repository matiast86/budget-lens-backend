import { Injectable } from '@nestjs/common';
import { CategoriesService } from '../categories/categories.service';
import { DebtOwnersService } from '../debt-owners/debt-owners.service';
import { GroupsService } from '../groups/groups.service';
import { PaymentMethodsService } from '../payment-methods/payment-methods.service';
import { TransactionsBreakDownService } from '../transactions-break-down/transactions-break-down.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsRepository } from './transactions.repository';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly categoriesService: CategoriesService,
    private readonly paymentMethodsService: PaymentMethodsService,
    private readonly debtOnwersService: DebtOwnersService,
    private readonly groupsService: GroupsService,
    private readonly transactionBDService: TransactionsBreakDownService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {}

  findAll() {
    return `This action returns all transactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
