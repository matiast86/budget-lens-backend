import { Injectable } from '@nestjs/common';
import { TransactionBreakDown } from 'prisma/generated/prisma/client';
import { CreateTransactionsBreakDownDto } from './dto/create-transactions-break-down.dto';
import { TransactionsBDRepository } from './transactions-break-down-repository';
import { TransactionBreakDownUpdateInput } from 'prisma/generated/prisma/models';

@Injectable()
export class TransactionsBreakDownService {
  constructor(
    private readonly transactionsBDRepository: TransactionsBDRepository,
  ) {}
  async create(
    createTransactionsBreakDownDto: CreateTransactionsBreakDownDto,
  ): Promise<TransactionBreakDown> {
    const { weekNumber, amount, transactionId } =
      createTransactionsBreakDownDto;
    return await this.transactionsBDRepository.create({
      weekNumber,
      amount,
      transaction: { connect: { id: transactionId } },
    });
  }

  async update(
    id: number,
    data: TransactionBreakDownUpdateInput,
  ): Promise<TransactionBreakDown> {
    return await this.transactionsBDRepository.update(id, data);
  }
}
