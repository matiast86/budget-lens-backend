import { Controller } from '@nestjs/common';
import { CategoryTemplatesService } from './category-templates.service';

@Controller('category-templates')
export class CategoryTemplatesController {
  constructor(private readonly categoryTemplatesService: CategoryTemplatesService) {}
}
