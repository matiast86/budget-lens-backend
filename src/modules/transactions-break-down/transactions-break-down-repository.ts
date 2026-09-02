import { Injectable } from '@nestjs/common';
import { Prisma, TransactionBreakDown } from 'prisma/generated/prisma/client';
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
    client: Prisma.TransactionClient = this.prisma,
  ): Promise<TransactionBreakDown> {
    return await client.transactionBreakDown.create({ data });
  }

  async createBundle(
    transactionId: number,
    client: Prisma.TransactionClient = this.prisma,
  ): Promise<TransactionBreakDown[]> {
    const data: TransactionBreakDownCreateManyInput[] = [
      { transactionId, amount: 0, weekNumber: 1 },
      { transactionId, amount: 0, weekNumber: 2 },
      { transactionId, amount: 0, weekNumber: 3 },
      { transactionId, amount: 0, weekNumber: 4 },
    ];
    return await client.transactionBreakDown.createManyAndReturn({ data });
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
