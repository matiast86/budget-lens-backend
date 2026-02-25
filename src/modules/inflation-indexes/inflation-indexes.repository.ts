import { Injectable } from '@nestjs/common';
import {
  Currency,
  InflationIndex,
  Prisma,
} from 'prisma/generated/prisma/client';
import { InflationIndexCreateInput } from 'prisma/generated/prisma/models';
import { handleP2025 } from 'src/helpers/errors';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InflationIndexesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: InflationIndexCreateInput): Promise<InflationIndex> {
    return await this.prisma.inflationIndex.create({ data });
  }

  async findById(id: number): Promise<InflationIndex | null> {
    return await this.prisma.inflationIndex.findUnique({ where: { id } });
  }

  async findManyPaginated(
    where: Prisma.InflationIndexWhereInput,
    skip: number,
    take: number,
    orderBy?: Prisma.InflationIndexOrderByWithRelationInput,
  ): Promise<InflationIndex[]> {
    return await this.prisma.inflationIndex.findMany({
      where,
      skip,
      take,
      orderBy,
    });
  }

  async findByCurrencyAndPeriod(
    currency: Currency,
    period: Date,
  ): Promise<InflationIndex | null> {
    return await this.prisma.inflationIndex.findUnique({
      where: { currency_period: { currency, period } },
    });
  }

  async update(
    id: number,
    data: Prisma.InflationIndexUpdateInput,
  ): Promise<InflationIndex> {
    return await this.prisma.inflationIndex
      .update({ where: { id }, data })
      .catch(handleP2025(`Index with id: ${id} not found`));
  }

  async delete(id: number): Promise<void> {
    await this.prisma.inflationIndex
      .delete({ where: { id } })
      .catch(handleP2025(`Index with id: ${id} not found`));
  }
}
