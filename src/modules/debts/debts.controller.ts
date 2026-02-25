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
  Query,
  Req,
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
import { LedgerRequest } from '../ledgers/entities/ledger-request';
import { DebtsService } from './debts.service';
import { DebtResponseDto } from './dto/debt-response.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';

@ApiBearerAuth()
@ApiTags('Debts')
@Controller('debts')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

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
  @ApiResponse({
    status: 200,
    description: 'List of debts',
    type: [DebtResponseDto],
  })
  @LedgerFrom('debtOwner', 'ownerId')
  @Get('owner/:ownerId')
  async findAll(
    @Param('ownerId', ParseIntPipe) ownerId: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
  ): Promise<DebtResponseDto[]> {
    return await this.debtsService.findAllByOwnerId(ownerId, skip, take);
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
  @LedgerFrom('debt', 'id')
  @Get(':id')
  async findOne(@Req() req: LedgerRequest): Promise<DebtResponseDto> {
    return (
      req.debt ?? (await this.debtsService.findOneById(Number(req.params.id)))
    );
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
  @LedgerFrom('debt', 'id')
  @Patch(':id')
  async update(
    @Req() req: LedgerRequest,
    @Body() updateDebtDto: UpdateDebtDto,
  ): Promise<DebtResponseDto> {
    return await this.debtsService.update(Number(req.params.id), updateDebtDto);
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
  @LedgerFrom('debt', 'id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Req() req: LedgerRequest): Promise<void> {
    return await this.debtsService.remove(Number(req.params.id));
  }
}
