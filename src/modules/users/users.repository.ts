import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from 'prisma/generated/prisma/client';
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

  async getUserById(id: string): Promise<UserDashboardView> {
    try {
      return await this.prisma.user.findUniqueOrThrow({
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
    } catch {
      throw new NotFoundException(`User with id: ${id} not found`);
    }
  }

  async findByEmail(email: string): Promise<UserDashboardView> {
    try {
      return await this.prisma.user.findUniqueOrThrow({
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
    } catch {
      throw new NotFoundException(`User with email: ${email} not found`);
    }
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return await this.prisma.user.create({
      data,
    });
  }
}
