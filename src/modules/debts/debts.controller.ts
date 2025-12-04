import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
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
import { Prisma } from '@prisma/client';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { DebtsService } from './debts.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { DebtResponseDto } from './dto/debt-response.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';

@ApiBearerAuth()
@ApiTags('Debts')
@UseGuards(AuthGuard)
@Controller('debts')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  // ============================================================
  // CREATE
  // ============================================================

  @ApiOperation({ summary: 'Create a new debt for a specific debt owner' })
  @ApiParam({
    name: 'ownerId',
    description: 'ID of the debt owner',
    example: 12,
  })
  @ApiResponse({
    status: 201,
    description: 'Debt created successfully',
    type: DebtResponseDto,
  })
  @Post()
  async create(
    @Param('ownerId', ParseIntPipe) ownerId: number,
    @Body() createDebtDto: CreateDebtDto,
  ): Promise<DebtResponseDto> {
    return await this.debtsService.create(ownerId, createDebtDto);
  }

  // ============================================================
  // GET ALL (PAGINATED)
  // ============================================================

  @ApiOperation({
    summary: 'Get all debts for a specific debt owner (paginated)',
  })
  @ApiParam({
    name: 'ownerId',
    example: 12,
    description: 'ID of the debt owner',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    example: 0,
    description: 'Number of records to skip',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of records to take',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    type: String,
    example: 'amount:desc',
    description: `Sorting format: "<field>:<direction>". Valid fields: amount, period, direction.`,
  })
  @ApiResponse({
    status: 200,
    description: 'List of debts',
    type: [DebtResponseDto],
  })
  @Get()
  async findAll(
    @Param('ownerId', ParseIntPipe) ownerId: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('orderBy') orderBy?: string,
  ): Promise<DebtResponseDto[]> {
    let parsedOrderBy: Prisma.DebtOrderByWithRelationInput = {};

    if (orderBy) {
      const [field, direction] = orderBy.split(':');
      parsedOrderBy = {
        [field]: direction === 'desc' ? 'desc' : 'asc',
      } as Prisma.DebtOrderByWithRelationInput;
    }

    return await this.debtsService.findAllByOwnerId(
      ownerId,
      skip,
      take,
      parsedOrderBy,
    );
  }

  // ============================================================
  // GET BY ID
  // ============================================================

  @ApiOperation({ summary: 'Retrieve a single debt by ID' })
  @ApiParam({
    name: 'id',
    example: 5,
    description: 'ID of the debt',
  })
  @ApiResponse({
    status: 200,
    description: 'Debt data',
    type: DebtResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Debt not found',
  })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DebtResponseDto> {
    return await this.debtsService.findOneById(id);
  }

  // ============================================================
  // UPDATE
  // ============================================================

  @ApiOperation({ summary: 'Update a debt by ID' })
  @ApiParam({
    name: 'id',
    example: 5,
    description: 'ID of the debt',
  })
  @ApiResponse({
    status: 200,
    description: 'Updated debt',
    type: DebtResponseDto,
  })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDebtDto: UpdateDebtDto,
  ): Promise<DebtResponseDto> {
    return await this.debtsService.update(id, updateDebtDto);
  }

  // ============================================================
  // DELETE
  // ============================================================

  @ApiOperation({ summary: 'Delete a debt by ID' })
  @ApiParam({
    name: 'id',
    example: 5,
    description: 'ID of the debt',
  })
  @ApiResponse({
    status: 204,
    description: 'Debt removed successfully',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.debtsService.remove(id);
  }
}
