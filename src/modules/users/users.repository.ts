import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserWithRelations } from 'src/types/entities/entities-with-relations';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  async getUserById(id: string): Promise<UserWithRelations> {
    try {
      return await this.prisma.user.findUniqueOrThrow({
        where: { id },
        include: { ledgers: true, collaborations: true },
      });
    } catch {
      throw new NotFoundException(`User with id: ${id} not found`);
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      return await this.prisma.user.findUniqueOrThrow({
        where: { email },
        include: { ledgers: true, collaborations: true },
      });
    } catch {
      throw new NotFoundException(`User with email: ${email} not found`);
    }
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return await this.prisma.user.update({ where: { id }, data });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return await this.prisma.user.create({ data });
  }
}
