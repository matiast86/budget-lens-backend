import { Injectable } from '@nestjs/common';
import { TransactionBreakDown } from 'prisma/generated/prisma/client';
import {
  TransactionBreakDownCreateInput,
  TransactionBreakDownCreateManyInput,
  TransactionBreakDownUpdateInput,
} from 'prisma/generated/prisma/models';
import { handleP2025 } from 'src/helpers/errors';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionsBDRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: TransactionBreakDownCreateInput,
  ): Promise<TransactionBreakDown> {
    return await this.prisma.transactionBreakDown.create({ data });
  }

  async createBundle(transactionId: number): Promise<TransactionBreakDown[]> {
    const data: TransactionBreakDownCreateManyInput[] = [
      { transactionId, amount: 0, weekNumber: 1 },
      { transactionId, amount: 0, weekNumber: 2 },
      { transactionId, amount: 0, weekNumber: 3 },
      { transactionId, amount: 0, weekNumber: 4 },
    ];
    return await this.prisma.transactionBreakDown.createManyAndReturn({ data });
  }

  async update(
    id: number,
    data: TransactionBreakDownUpdateInput,
  ): Promise<TransactionBreakDown> {
    return await this.prisma.transactionBreakDown
      .update({
        where: { id },
        data,
      })
      .catch(handleP2025(`BreakDown with id: ${id} not found.`));
  }
}
