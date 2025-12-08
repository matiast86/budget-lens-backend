import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PaymentMethod,
  PaymentType,
  Prisma,
} from 'prisma/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentMethodsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PaymentMethodCreateInput): Promise<PaymentMethod> {
    return await this.prisma.paymentMethod.create({
      data,
      include: { transactions: true },
    });
  }

  async findAllByUser(userId: string): Promise<PaymentMethod[]> {
    return await this.prisma.paymentMethod.findMany({ where: { userId } });
  }

  async findById(id: number, userId: string): Promise<PaymentMethod> {
    try {
      return await this.prisma.paymentMethod.findUniqueOrThrow({
        where: { id_userId: { id, userId } },
        include: { transactions: true },
      });
    } catch {
      throw new NotFoundException(`Payment method with id: ${id} not found`);
    }
  }

  async findByName(userId: string, name: string): Promise<PaymentMethod> {
    try {
      return await this.prisma.paymentMethod.findUniqueOrThrow({
        where: { userId_name: { userId, name } },
        include: { transactions: true },
      });
    } catch {
      throw new NotFoundException(
        `Payment method with name: ${name} not found`,
      );
    }
  }

  async findByType(
    userId: string,
    type: PaymentType,
  ): Promise<PaymentMethod[]> {
    return await this.prisma.paymentMethod.findMany({
      where: { userId, type },
    });
  }

  async update(
    id: number,
    userId: string,
    data: Prisma.PaymentMethodUpdateInput,
  ): Promise<PaymentMethod> {
    return await this.prisma.paymentMethod.update({
      where: { id_userId: { id, userId } },
      data,
      include: { transactions: true },
    });
  }

  async delete(id: number, userId: string): Promise<void> {
    await this.prisma.paymentMethod.delete({
      where: { id_userId: { id, userId } },
    });
  }
}
