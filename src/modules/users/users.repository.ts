import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'prisma/generated/prisma/client';
import { handleP2025 } from 'src/helpers/errors';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDashboardView } from 'src/types/entities/user.types';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers(): Promise<User[]> {
    return await this.prisma.user.findMany({
      include: {
        ledgers: true,
        collaborations: true,
        paymentMethods: true,
        groups: true,
      },
    });
  }

  async getUserById(id: string): Promise<UserDashboardView | null> {
    return await this.prisma.user.findUnique({
      where: { id },
      include: {
        ledgers: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string): Promise<UserDashboardView | null> {
    return await this.prisma.user.findUnique({
      where: { email },
      include: {
        ledgers: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return await this.prisma.user
      .update({
        where: { id },
        data,
      })
      .catch(handleP2025(`User with id: ${id} not found.`));
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return await this.prisma.user.create({
      data,
    });
  }
}
