import { Injectable } from '@nestjs/common';
import { CategoryTemplate, Prisma } from 'prisma/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryTemplatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.CategoryTemplateCreateInput,
  ): Promise<CategoryTemplate> {
    return await this.prisma.categoryTemplate.create({ data });
  }

  async findAll(): Promise<CategoryTemplate[]> {
    return await this.prisma.categoryTemplate.findMany();
  }
}
