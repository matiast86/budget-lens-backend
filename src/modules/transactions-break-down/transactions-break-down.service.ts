import { Injectable } from '@nestjs/common';
import { TransactionBreakDown } from 'prisma/generated/prisma/client';
import { TransactionBreakDownUpdateInput } from 'prisma/generated/prisma/models';
import { transactionBdArrayToArrayDto } from 'src/helpers/mappers/transaction-bd.mapper';
import { CreateTransactionsBreakDownDto } from './dto/create-transactions-break-down.dto';
import { TransactionBreakDownResponseDto } from './dto/transaction-break-down-response.dto';
import { TransactionsBDRepository } from './transactions-break-down-repository';

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

  async createBundle(
    transactionId: number,
  ): Promise<TransactionBreakDownResponseDto[]> {
    const bd = await this.transactionsBDRepository.createBundle(transactionId);
    return transactionBdArrayToArrayDto(bd);
  }

  async update(
    id: number,
    data: TransactionBreakDownUpdateInput,
  ): Promise<TransactionBreakDown> {
    return await this.transactionsBDRepository.update(id, data);
  }
}
