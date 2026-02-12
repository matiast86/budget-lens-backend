import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { LedgerFrom } from 'src/decorators/ledger-from/ledger-from.decorator';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { AssignBreakDownDto } from '../transactions-break-down/dto/assign-break-down.dto';
import { CreateIncomeDto } from './dto/create-income.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { TransactionsService } from './transactions.service';

@ApiBearerAuth()
@ApiTags('Transactions')
@UseGuards(AuthGuard)
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
  @ApiOperation({ summary: 'List transactions for a ledger' })
  @ApiParam({
    name: 'ledgerId',
    type: Number,
    description: 'ID of the ledger',
  })
  @ApiQuery({
    name: 'skip',
    type: Number,
    required: false,
    description: 'Number of records to skip (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'take',
    type: Number,
    required: false,
    description: 'Number of records to return (default: 20)',
    example: 20,
  })
  @ApiOkResponse({ type: TransactionResponseDto, isArray: true })
  @ApiNotFoundResponse({ description: 'Ledger not found' })
  async findAllByLedger(
    @Param('ledgerId', ParseIntPipe) ledgerId: number,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ): Promise<TransactionResponseDto[]> {
    return await this.transactionsService.findAllByLedgerId(
      ledgerId,
      skip ? +skip : undefined,
      take ? +take : undefined,
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
}
