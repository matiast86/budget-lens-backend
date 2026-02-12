import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LedgerFrom } from 'src/decorators/ledger-from/ledger-from.decorator';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { LedgerRequest } from '../ledgers/entities/ledger-request';
import { CategoriesService } from './categories.service';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiBearerAuth()
@ApiTags('Categories')
@UseGuards(AuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Create a category within a ledger' })
  @ApiParam({
    name: 'ledgerId',
    type: Number,
    description: 'ID of the ledger where the category will be created',
    example: 10,
  })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid data or duplicate name' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User or ledger not found' })
  @Post('ledgers/:ledgerId')
  async create(
    @Param('ledgerId', ParseIntPipe) ledgerId: number,
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return await this.categoriesService.create(ledgerId, createCategoryDto);
  }

  @ApiOperation({ summary: 'List categories for a ledger' })
  @ApiParam({
    name: 'ledgerId',
    type: Number,
    description: 'ID of the ledger whose categories will be listed',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Categories for the given ledger',
    type: [CategoryResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('ledgers/:ledgerId')
  async findAll(
    @Param('ledgerId', ParseIntPipe) ledgerId: number,
  ): Promise<CategoryResponseDto[]> {
    return await this.categoriesService.findAll(ledgerId);
  }

  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the category',
    example: 78,
  })
  @ApiResponse({
    status: 200,
    description: 'Category found',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @LedgerFrom('category', 'id')
  @Get(':id')
  async findOne(@Req() req: LedgerRequest): Promise<CategoryResponseDto> {
    return (
      req.category ??
      (await this.categoriesService.findOneById(Number(req.params.id)))
    );
  }

  @ApiOperation({ summary: 'Find a category by name within a ledger' })
  @ApiParam({
    name: 'ledgerId',
    type: Number,
    description: 'ID of the ledger to search',
    example: 10,
  })
  @ApiQuery({
    name: 'name',
    required: true,
    type: String,
    description: 'Category name to search for',
    example: 'Utilities',
  })
  @ApiResponse({
    status: 200,
    description: 'Category found',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @Get('ledgers/:ledgerId/search')
  async findByName(
    @Param('ledgerId', ParseIntPipe) ledgerId: number,
    @Query('name') name: string,
  ): Promise<CategoryResponseDto> {
    return await this.categoriesService.findOneByName(ledgerId, name);
  }

  @ApiOperation({ summary: 'Update a category by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the category to update',
    example: 78,
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @LedgerFrom('category', 'id')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return await this.categoriesService.update(id, updateCategoryDto);
  }

  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the category to delete',
    example: 78,
  })
  @ApiResponse({ status: 204, description: 'Category deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @LedgerFrom('category', 'id')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.categoriesService.remove(id);
  }
}
