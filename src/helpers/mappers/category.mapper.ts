import { CategoryResponseDto } from 'src/modules/categories/dto/category-response.dto';
import { CategoryMinimal } from 'src/types/entities/entities-with-relations';

export const categoryToResponseDto = (
  category: CategoryMinimal,
): CategoryResponseDto => {
  const { id, name, description } = category;
  return new CategoryResponseDto({
    id,
    name,
    description: description ?? undefined,
  });
};

export const categoryArraytoArrayDto = (
  entityArray: CategoryMinimal[],
): CategoryResponseDto[] => {
  return entityArray ? entityArray.map((c) => categoryToResponseDto(c)) : [];
};
