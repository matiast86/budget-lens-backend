import { Injectable } from '@nestjs/common';
import { Group } from 'prisma/generated/prisma/client';
import {
  GroupCreateInput,
  GroupUpdateInput,
} from 'prisma/generated/prisma/models';
import { handleP2025 } from 'src/helpers/errors';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GroupsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: GroupCreateInput): Promise<Group> {
    return await this.prisma.group.create({ data });
  }

  async findById(id: number): Promise<Group | null> {
    return await this.prisma.group.findUnique({ where: { id } });
  }

  async findByName(ledgerId: number, name: string): Promise<Group | null> {
    return await this.prisma.group.findUnique({
      where: { ledgerId_name: { ledgerId, name } },
    });
  }

  async findAllByLedgerId(ledgerId: number): Promise<Group[]> {
    return await this.prisma.group.findMany({ where: { ledgerId } });
  }

  async update(id: number, data: GroupUpdateInput): Promise<Group> {
    return await this.prisma.group
      .update({ where: { id }, data })
      .catch(handleP2025(`Group with id: ${id} not found.`));
  }

  async delete(id: number): Promise<void> {
    await this.prisma.group
      .delete({ where: { id } })
      .catch(handleP2025(`Group with id: ${id} not found.`));
  }
}
