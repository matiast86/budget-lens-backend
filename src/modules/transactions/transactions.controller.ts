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
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { LedgerFrom } from 'src/decorators/ledger-from/ledger-from.decorator';
import { AssignBreakDownDto } from '../transactions-break-down/dto/assign-break-down.dto';
import { CreateIncomeDto } from './dto/create-income.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { FilterTransactionsDto } from './dto/filter-transactions.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { UpdateTransactionCoreDto } from './dto/update-transaction-core.dto';
import { UpdateTransactionFlagsDto } from './dto/update-transaction-flags.dto';
import { TransactionsService } from './transactions.service';

@ApiBearerAuth()
@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('ledgers/:ledgerId/expenses')
  @ApiOperation({ summary: 'Create an expense transaction within a ledger' })
  @ApiParam({
    name: 'ledgerId',
    type: Number,
    description: 'ID of the ledger',
  })
  @ApiCreatedResponse({ type: TransactionResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid payload or missing exchange rate',
  })
  @ApiNotFoundResponse({ description: 'Ledger not found' })
  async createExpense(
    @Param('ledgerId', ParseIntPipe) ledgerId: number,
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto | TransactionResponseDto[]> {
    return await this.transactionsService.createExpense(
      ledgerId,
      createTransactionDto,
    );
  }

  @Post('ledgers/:ledgerId/incomes')
  @ApiOperation({ summary: 'Create an income transaction within a ledger' })
  @ApiParam({
    name: 'ledgerId',
    type: Number,
    description: 'ID of the ledger',
  })
  @ApiCreatedResponse({ type: TransactionResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid payload or missing exchange rate',
  })
  @ApiNotFoundResponse({ description: 'Ledger not found' })
  async createIncome(
    @Param('ledgerId', ParseIntPipe) ledgerId: number,
    @Body() createIncomeDto: CreateIncomeDto,
  ): Promise<TransactionResponseDto> {
    return await this.transactionsService.createIncome(
      ledgerId,
      createIncomeDto,
    );
  }

  @Get('ledgers/:ledgerId')
  @ApiOperation({
    summary: 'List transactions for a ledger with optional filters',
  })
  @ApiParam({
    name: 'ledgerId',
    type: Number,
    description: 'ID of the ledger',
  })
  @ApiQuery({
    name: 'skip',
    type: Number,
    required: false,
    description: 'Number of records to skip (default: 0)',
    example: 0,
  })
  @ApiQuery({
    name: 'take',
    type: Number,
    required: false,
    description: 'Number of records to return (default: 50)',
    example: 50,
  })
  @ApiOkResponse({ type: TransactionResponseDto, isArray: true })
  @ApiNotFoundResponse({ description: 'Ledger not found' })
  async findAllByLedger(
    @Param('ledgerId', ParseIntPipe) ledgerId: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip = 0,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take = 50,
    @Query() filters: FilterTransactionsDto,
  ): Promise<TransactionResponseDto[]> {
    return await this.transactionsService.findAllByLedgerId(
      ledgerId,
      skip,
      take,
      filters,
    );
  }

  @LedgerFrom('transaction', 'id')
  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Transaction ID',
  })
  @ApiOkResponse({ type: TransactionResponseDto })
  @ApiNotFoundResponse({ description: 'Transaction not found' })
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TransactionResponseDto> {
    return await this.transactionsService.findById(id);
  }

  @LedgerFrom('transaction', 'id')
  @Patch(':id/breakdown')
  @ApiOperation({ summary: 'Assign weekly breakdown amounts to a transaction' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Transaction ID',
  })
  @ApiOkResponse({ type: TransactionResponseDto })
  @ApiNotFoundResponse({ description: 'Transaction not found' })
  async assignBreakDown(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignBreakDownDto: AssignBreakDownDto,
  ): Promise<TransactionResponseDto> {
    return await this.transactionsService.assignBreakDown(
      id,
      assignBreakDownDto,
    );
  }

  @LedgerFrom('transaction', 'id')
  @Patch(':id/flags')
  @ApiOperation({
    summary: 'Toggle isPaid and/or impactsCashflow flags on a transaction',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Transaction ID' })
  @ApiOkResponse({ type: TransactionResponseDto })
  @ApiNotFoundResponse({ description: 'Transaction not found' })
  async updateFlags(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransactionFlagsDto,
  ): Promise<TransactionResponseDto> {
    return await this.transactionsService.updateFlags(id, dto);
  }

  @LedgerFrom('transaction', 'id')
  @Patch(':id/category/:targetId')
  @ApiOperation({ summary: 'Change the category of a transaction' })
  @ApiParam({ name: 'id', type: Number, description: 'Transaction ID' })
  @ApiParam({ name: 'targetId', type: Number, description: 'New category ID' })
  @ApiOkResponse({ type: TransactionResponseDto })
  @ApiNotFoundResponse({ description: 'Transaction or category not found' })
  async changeCategory(
    @Param('id', ParseIntPipe) id: number,
    @Param('targetId', ParseIntPipe) targetId: number,
  ): Promise<TransactionResponseDto> {
    return await this.transactionsService.changeRelation(
      id,
      'category',
      targetId,
    );
  }

  @LedgerFrom('transaction', 'id')
  @Patch(':id/group/:targetId')
  @ApiOperation({ summary: 'Change the group of a transaction' })
  @ApiParam({ name: 'id', type: Number, description: 'Transaction ID' })
  @ApiParam({ name: 'targetId', type: Number, description: 'New group ID' })
  @ApiOkResponse({ type: TransactionResponseDto })
  @ApiNotFoundResponse({ description: 'Transaction or group not found' })
  async changeGroup(
    @Param('id', ParseIntPipe) id: number,
    @Param('targetId', ParseIntPipe) targetId: number,
  ): Promise<TransactionResponseDto> {
    return await this.transactionsService.changeRelation(id, 'group', targetId);
  }

  @LedgerFrom('transaction', 'id')
  @Patch(':id/payment-method/:targetId')
  @ApiOperation({ summary: 'Change the payment method of a transaction' })
  @ApiParam({ name: 'id', type: Number, description: 'Transaction ID' })
  @ApiParam({
    name: 'targetId',
    type: Number,
    description: 'New payment method ID',
  })
  @ApiOkResponse({ type: TransactionResponseDto })
  @ApiNotFoundResponse({
    description: 'Transaction or payment method not found',
  })
  async changePaymentMethod(
    @Param('id', ParseIntPipe) id: number,
    @Param('targetId', ParseIntPipe) targetId: number,
  ): Promise<TransactionResponseDto> {
    return await this.transactionsService.changeRelation(
      id,
      'paymentMethod',
      targetId,
    );
  }

  @LedgerFrom('transaction', 'id')
  @Patch(':id')
  @ApiOperation({
    summary:
      'Update core fields of a transaction (amount, date, comment, relations)',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Transaction ID' })
  @ApiOkResponse({ type: TransactionResponseDto })
  @ApiNotFoundResponse({ description: 'Transaction not found' })
  async updateTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransactionCoreDto,
  ): Promise<TransactionResponseDto> {
    return await this.transactionsService.updateCore(id, dto);
  }

  @LedgerFrom('transaction', 'id')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiParam({ name: 'id', type: Number, description: 'Transaction ID' })
  @ApiNoContentResponse({ description: 'Transaction deleted' })
  @ApiNotFoundResponse({ description: 'Transaction not found' })
  async deleteTransaction(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return await this.transactionsService.deleteTransaction(id);
  }
}
