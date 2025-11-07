import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  async getUserById(id: string): Promise<User> {
    try {
      return await this.prisma.user.findUniqueOrThrow({ where: { id } });
    } catch {
      throw new NotFoundException(`User with id: ${id} not found`);
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      return await this.prisma.user.findUniqueOrThrow({
        where: { email },
      });
    } catch {
      throw new NotFoundException(`User with email: ${email} not found`);
    }
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return await this.prisma.user.update({ where: { id }, data });
  }
}
