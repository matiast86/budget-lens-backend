import { Module } from '@nestjs/common';
import { CategoryTemplatesService } from './category-templates.service';
import { CategoryTemplatesController } from './category-templates.controller';

@Module({
  controllers: [CategoryTemplatesController],
  providers: [CategoryTemplatesService],
})
export class CategoryTemplatesModule {}
