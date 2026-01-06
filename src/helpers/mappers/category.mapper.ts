import { Category } from 'prisma/generated/prisma/client';
import { CategoryResponseDto } from 'src/modules/categories/dto/category-response.dto';

export const categoryToResponseDto = (
  category: Category,
): CategoryResponseDto => {
  const { id, name, description, ledgerId, templateId } = category;
  return new CategoryResponseDto({
    id,
    name,
    description: description ?? undefined,
    ledgerId,
    templateId: templateId ?? undefined,
  });
};

export const categoryArraytoArrayDto = (
  entityArray: Category[],
): CategoryResponseDto[] => {
  return entityArray ? entityArray.map((c) => categoryToResponseDto(c)) : [];
};
