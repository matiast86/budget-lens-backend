import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserWithRelations } from 'src/types/entities/entities-with-relations';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers(): Promise<UserWithRelations[]> {
    return await this.prisma.user.findMany({
      include: {
        ledgers: true,
        collaborations: true,
        paymentMethods: true,
        groups: true,
      },
    });
  }

  async getUserById(id: string): Promise<UserWithRelations> {
    try {
      return await this.prisma.user.findUniqueOrThrow({
        where: { id },
        include: {
          ledgers: true,
          collaborations: true,
          paymentMethods: true,
          groups: true,
        },
      });
    } catch {
      throw new NotFoundException(`User with id: ${id} not found`);
    }
  }

  async findByEmail(email: string): Promise<UserWithRelations> {
    try {
      return await this.prisma.user.findUniqueOrThrow({
        where: { email },
        include: {
          ledgers: true,
          collaborations: true,
          paymentMethods: true,
          groups: true,
        },
      });
    } catch {
      throw new NotFoundException(`User with email: ${email} not found`);
    }
  }

  async update(
    id: string,
    data: Prisma.UserUpdateInput,
  ): Promise<UserWithRelations> {
    return await this.prisma.user.update({
      where: { id },
      data,
      include: {
        ledgers: true,
        collaborations: true,
        paymentMethods: true,
        groups: true,
      },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<UserWithRelations> {
    return await this.prisma.user.create({
      data,
      include: {
        ledgers: true,
        collaborations: true,
        paymentMethods: true,
        groups: true,
      },
    });
  }
}
