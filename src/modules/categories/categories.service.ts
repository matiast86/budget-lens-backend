import { Injectable, NotFoundException } from '@nestjs/common';
import {
  categoryArraytoArrayDto,
  categoryToResponseDto,
} from 'src/helpers/mappers/category.mapper';
import { CategoriesRepository } from './categories.repository';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async create(
    ledgerId: number,
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const { name, description } = createCategoryDto;
    const category = await this.categoriesRepository.create({
      name,
      description,
      ledger: { connect: { id: ledgerId } },
    });

    return categoryToResponseDto(category);
  }

  async findAll(ledgerId: number): Promise<CategoryResponseDto[]> {
    const categories =
      await this.categoriesRepository.findAllByLedgerId(ledgerId);
    return categoryArraytoArrayDto(categories);
  }

  async findOneById(id: number): Promise<CategoryResponseDto> {
    const category = await this.categoriesRepository.findById(id);
    if (!category)
      throw new NotFoundException(`Category with id: ${id} not found.`);
    return categoryToResponseDto(category);
  }

  async findOneByName(
    ledgerId: number,
    name: string,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoriesRepository.findByName(ledgerId, name);
    if (!category) throw new NotFoundException(`Category ${name} not found.`);
    return categoryToResponseDto(category);
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoriesRepository.findById(id);
    if (!category)
      throw new NotFoundException(`Category with id: ${id} not found.`);
    // remove template and update category as a new one
    if (category.templateId) {
      const updated = await this.categoriesRepository.removeTemplate(
        id,
        category.templateId,
        { ...updateCategoryDto },
      );

      return categoryToResponseDto(updated);
    }

    const updated = await this.categoriesRepository.update(id, {
      ...updateCategoryDto,
    });
    return categoryToResponseDto(updated);
  }

  async remove(id: number): Promise<void> {
    await this.categoriesRepository.delete(id);
  }

  async findEntityById(id: number): Promise<CategoryResponseDto | undefined> {
    const category = await this.categoriesRepository.findById(id);

    return category ? categoryToResponseDto(category) : undefined;
  }
}
