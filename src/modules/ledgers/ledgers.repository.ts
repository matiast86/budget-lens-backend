import { Injectable, NotFoundException } from '@nestjs/common';
import { Ledger, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LedgersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Ledger[]> {
    return await this.prisma.ledger.findMany();
  }

  async findAllPaginated(
    skip: number,
    take: number,
    where?: Prisma.LedgerWhereInput,
  ): Promise<Ledger[]> {
    return await this.prisma.ledger.findMany({ where, skip, take });
  }

  async findLedgerById(id: number): Promise<Ledger> {
    try {
      return await this.prisma.ledger.findFirstOrThrow({ where: { id } });
    } catch {
      throw new NotFoundException(`Ledger with id: ${id} not found`);
    }
  }

  async findLedgerByName(name: string): Promise<Ledger> {
    try {
      return await this.prisma.ledger.findFirstOrThrow({ where: { name } });
    } catch {
      throw new NotFoundException(`Ledger with id: ${name} not found`);
    }
  }

  async update(id: number, data: Partial<Ledger>): Promise<Ledger> {
    return await this.prisma.ledger.update({ where: { id }, data });
  }

  async create(data: Prisma.LedgerCreateInput): Promise<Ledger> {
    return await this.prisma.ledger.create({ data });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.ledger.delete({ where: { id } });
  }
}
