import { Injectable, NotFoundException } from '@nestjs/common';
import { Collaboration } from 'prisma/generated/prisma/client';
import {
  CollaborationCreateInput,
  CollaborationUpdateInput,
} from 'prisma/generated/prisma/models';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CollaborationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async addCollaboration(
    data: CollaborationCreateInput,
  ): Promise<Collaboration> {
    return await this.prisma.collaboration.create({ data });
  }

  async findById(id: number): Promise<Collaboration> {
    try {
      return await this.prisma.collaboration.findUniqueOrThrow({
        where: { id },
      });
    } catch {
      throw new NotFoundException(`Collaboration with id: ${id} not found.`);
    }
  }

  async findByName(name: string): Promise<Collaboration> {
    try {
      return await this.prisma.collaboration.findFirstOrThrow({
        where: { name },
      });
    } catch {
      throw new NotFoundException(
        `Collaboration with name: ${name} not found.`,
      );
    }
  }

  async findAllByUserId(userId: string): Promise<Collaboration[]> {
    return await this.prisma.collaboration.findMany({ where: { userId } });
  }

  async findAllByLedgerId(ledgerId: number): Promise<Collaboration[]> {
    return await this.prisma.collaboration.findMany({ where: { ledgerId } });
  }

  async update(
    id: number,
    data: CollaborationUpdateInput,
  ): Promise<Collaboration> {
    return await this.prisma.collaboration.update({ where: { id }, data });
  }
}
