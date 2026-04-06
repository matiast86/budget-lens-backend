import { Injectable } from '@nestjs/common';
import {
  PaymentMethod,
  PaymentType,
  Prisma,
} from 'prisma/generated/prisma/client';
import { handleP2025 } from 'src/helpers/errors';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentMethodsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PaymentMethodCreateInput): Promise<PaymentMethod> {
    return await this.prisma.paymentMethod.create({
      data,
    });
  }

  async findAllByUser(userId: string): Promise<PaymentMethod[]> {
    return await this.prisma.paymentMethod.findMany({
      where: { userId, isActive: true },
    });
  }

  async findById(id: number, userId: string): Promise<PaymentMethod | null> {
    return await this.prisma.paymentMethod.findUnique({
      where: { id_userId: { id, userId } },
    });
  }

  async findByName(
    userId: string,
    name: string,
  ): Promise<PaymentMethod | null> {
    return await this.prisma.paymentMethod.findUnique({
      where: { userId_name: { userId, name } },
    });
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
    return await this.prisma.paymentMethod
      .update({
        where: { id_userId: { id, userId } },
        data,
      })
      .catch(handleP2025(`Payment method with id: ${id} not found.`));
  }

  async delete(id: number, userId: string): Promise<void> {
    await this.prisma.paymentMethod
      .delete({
        where: { id_userId: { id, userId } },
      })
      .catch(handleP2025(`Payment method with id: ${id} not found.`));
  }

  async findOne(id: number): Promise<PaymentMethod | null> {
    return await this.prisma.paymentMethod.findUnique({ where: { id } });
  }

  async addToLedger(
    userId: string,
    ledgerId: number,
    pmIds: number[],
  ): Promise<void> {
    await this.prisma.ledgerPaymentMethod.createMany({
      data: pmIds.map((id) => ({
        paymentMethodId: id,
        ledgerId,
        assignedBy: userId,
      })),
    });
  }
}
