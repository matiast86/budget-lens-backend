import { CategoryEntity } from 'src/modules/categories/entities/category.entity';
import { CategoryWithRelations } from 'src/types/entities/entities-with-relations';

export const categoryToEntity = (
  category: CategoryWithRelations,
): CategoryEntity => {
  const categoryEntity: CategoryEntity = {};
  return categoryEntity;
};

export const categoryEntityToResponseDto = (category: CategoryEntity) => {};

export const categoryArraytoArrayDto = (entityArray: CategoryEntity[]) => {};
