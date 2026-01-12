import { Injectable } from '@nestjs/common';
import { Category } from 'prisma/generated/prisma/client';
import {
  CategoryCreateInput,
  CategoryUpdateInput,
} from 'prisma/generated/prisma/models';
import { handleP2025 } from 'src/helpers/errors';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CategoryCreateInput) {
    return await this.prisma.category.create({ data });
  }

  async findById(id: number): Promise<Category | null> {
    return await this.prisma.category.findUnique({
      where: { id },
    });
  }

  async findByName(ledgerId: number, name: string): Promise<Category | null> {
    return await this.prisma.category.findUnique({
      where: { ledgerId_name: { ledgerId, name } },
    });
  }

  async findAllByLedgerId(ledgerId: number): Promise<Category[]> {
    return await this.prisma.category.findMany({
      where: { ledgerId },
    });
  }

  async update(id: number, data: CategoryUpdateInput): Promise<Category> {
    return await this.prisma.category
      .update({ where: { id }, data })
      .catch(handleP2025(`Category with id: ${id} not found.`));
  }

  async removeTemplate(
    id: number,
    templateId: number,
    data: CategoryUpdateInput,
  ): Promise<Category> {
    return await this.prisma.category.update({
      where: { id },
      data: {
        ...data,
        template: { disconnect: { id: templateId } },
      },
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.category
      .delete({ where: { id } })
      .catch(handleP2025(`Category with id: ${id} not found.`));
  }
}
