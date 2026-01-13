import { Injectable } from '@nestjs/common';
import { TransactionBreakDown } from 'prisma/generated/prisma/client';
import {
  TransactionBreakDownCreateInput,
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
