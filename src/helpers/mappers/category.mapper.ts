import { CategoryResponseDto } from 'src/modules/categories/dto/category-response.dto';
import { CategoryEntity } from 'src/modules/categories/entities/category.entity';
import { CategoryMinimal } from 'src/types/entities/entities-with-relations';

export const categoryToEntity = (category: CategoryMinimal): CategoryEntity => {
  const { id, name, description } = category;

  return new CategoryEntity({
    id,
    name,
    description: description ? description : undefined,
  });
};

export const categoryEntityToResponseDto = (
  category: CategoryEntity,
): CategoryResponseDto => {
  const { id, name, description } = category;
  return new CategoryResponseDto({ id, name, description });
};

export const categoryArraytoArrayDto = (
  entityArray: CategoryEntity[],
): CategoryResponseDto[] => {
  return entityArray.map((c) => categoryEntityToResponseDto(c));
};
