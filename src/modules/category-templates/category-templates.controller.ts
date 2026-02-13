import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from 'prisma/generated/prisma/enums';
import { Roles } from 'src/decorators/roles/roles.decorator';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { CategoryTemplatesService } from './category-templates.service';
import { CategoryTemplateResponseDto } from './dto/category-template-response.dto';
import { CreateCategoryTemplateDto } from './dto/create-category-template.dto';

@ApiBearerAuth()
@ApiTags('Category Templates')
@UseGuards(RolesGuard)
@Controller('category-templates')
export class CategoryTemplatesController {
  constructor(
    private readonly categoryTemplatesService: CategoryTemplatesService,
  ) {}

  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new category template' })
  @ApiCreatedResponse({ type: CategoryTemplateResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid payload or duplicate name' })
  async create(
    @Body() createTemplateDto: CreateCategoryTemplateDto,
  ): Promise<CategoryTemplateResponseDto> {
    return await this.categoryTemplatesService.create(createTemplateDto);
  }

  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'List all category templates' })
  @ApiOkResponse({ type: CategoryTemplateResponseDto, isArray: true })
  async findAll(): Promise<CategoryTemplateResponseDto[]> {
    return await this.categoryTemplatesService.findAll();
  }
}
