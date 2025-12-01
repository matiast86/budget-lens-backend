import { Category } from '@prisma/client';
import { CategoryResponseDto } from 'src/modules/categories/dto/category-response.dto';

export const categoryToResponseDto = (
  category: Category,
): CategoryResponseDto => {
  const { id, name, description } = category;
  return new CategoryResponseDto({
    id,
    name,
    description: description ?? undefined,
  });
};

export const categoryArraytoArrayDto = (
  entityArray: Category[],
): CategoryResponseDto[] => {
  return entityArray ? entityArray.map((c) => categoryToResponseDto(c)) : [];
};
