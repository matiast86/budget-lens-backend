import { Injectable } from '@nestjs/common';
import { Collaboration } from 'prisma/generated/prisma/client';
import {
  CollaborationCreateInput,
  CollaborationUpdateInput,
} from 'prisma/generated/prisma/models';
import { handleP2025 } from 'src/helpers/errors';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CollaborationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async addCollaboration(
    data: CollaborationCreateInput,
  ): Promise<Collaboration> {
    return await this.prisma.collaboration.create({ data });
  }

  async findById(id: number): Promise<Collaboration | null> {
    return await this.prisma.collaboration.findUnique({
      where: { id },
    });
  }

  async findUniqueNullable(
    ledgerId: number,
    userId: string,
  ): Promise<Collaboration | null> {
    return this.prisma.collaboration.findUnique({
      where: { userId_ledgerId: { userId, ledgerId } },
    });
  }

  async findAllByUserId(userId: string): Promise<Collaboration[]> {
    return await this.prisma.collaboration.findMany({
      where: { userId, isActive: true },
    });
  }

  async findAllByLedgerId(ledgerId: number): Promise<Collaboration[]> {
    return await this.prisma.collaboration.findMany({ where: { ledgerId } });
  }

  async update(
    id: number,
    data: CollaborationUpdateInput,
  ): Promise<Collaboration> {
    return await this.prisma.collaboration
      .update({ where: { id }, data })
      .catch(handleP2025(`Collaboration with id: ${id} not found.`));
  }
}
