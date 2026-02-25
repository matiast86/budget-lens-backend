import { Injectable } from '@nestjs/common';
import { CategoryScope } from 'prisma/generated/prisma/client';
import { CategoryTemplatesRepository } from './category-templates.repository';
import { CategoryTemplateResponseDto } from './dto/category-template-response.dto';
import { CreateCategoryTemplateDto } from './dto/create-category-template.dto';

@Injectable()
export class CategoryTemplatesService {
  constructor(
    private readonly templatesRepository: CategoryTemplatesRepository,
  ) {}

  async create(
    createTemplateDto: CreateCategoryTemplateDto,
  ): Promise<CategoryTemplateResponseDto> {
    const { name, description } = createTemplateDto;
    const template = await this.templatesRepository.create({
      name,
      description,
      scope: CategoryScope.GLOBAL,
    });
    return new CategoryTemplateResponseDto(template);
  }

  async findAll(): Promise<CategoryTemplateResponseDto[]> {
    const templates = await this.templatesRepository.findAll();
    return templates.map((t) => new CategoryTemplateResponseDto(t));
  }
}
