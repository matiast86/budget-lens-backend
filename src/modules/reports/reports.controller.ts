import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CashflowReportDto } from './dto/cashflow-report.dto';
import { CategoryEvolutionReportDto } from './dto/category-evolution-report.dto';
import { DebtReportDto } from './dto/debt-report.dto';
import { ReportsService } from './reports.service';

@ApiBearerAuth()
@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('ledgers/:ledgerId/cashflow')
  @ApiOperation({
    summary: 'Cashflow report for a ledger',
    description:
      'Returns income and expense totals grouped by payment method and group for each period. ' +
      'Each period includes inicialMes (full planned amount) and balance (week-aware remainder). ' +
      'Replicates the Excel CASHFLOW pivot table.',
  })
  @ApiParam({ name: 'ledgerId', type: Number, description: 'ID of the ledger' })
  @ApiQuery({
    name: 'from',
    type: String,
    required: true,
    description: 'Start of period range (YYYY-MM)',
    example: '2025-09',
  })
  @ApiQuery({
    name: 'to',
    type: String,
    required: true,
    description: 'End of period range (YYYY-MM)',
    example: '2026-02',
  })
  @ApiOkResponse({ type: CashflowReportDto })
  @ApiNotFoundResponse({ description: 'Ledger not found' })
  getCashflow(
    @Param('ledgerId', ParseIntPipe) ledgerId: number,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<CashflowReportDto> {
    return this.reportsService.getCashflow(ledgerId, from, to);
  }

  @Get('ledgers/:ledgerId/debts')
  @ApiOperation({
    summary: 'Debt report for a ledger',
    description:
      'Returns debt totals grouped by debt owner for each period, with per-description breakdown. ' +
      'Positive amounts = owed to me, negative = owed by me. ' +
      'Replicates the Excel TD Deudas pivot table.',
  })
  @ApiParam({ name: 'ledgerId', type: Number, description: 'ID of the ledger' })
  @ApiQuery({
    name: 'from',
    type: String,
    required: true,
    description: 'Start of period range (YYYY-MM)',
    example: '2026-01',
  })
  @ApiQuery({
    name: 'to',
    type: String,
    required: true,
    description: 'End of period range (YYYY-MM)',
    example: '2026-06',
  })
  @ApiOkResponse({ type: DebtReportDto })
  @ApiNotFoundResponse({ description: 'Ledger not found' })
  getDebtReport(
    @Param('ledgerId', ParseIntPipe) ledgerId: number,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<DebtReportDto> {
    return this.reportsService.getDebtReport(ledgerId, from, to);
  }

  @Get('ledgers/:ledgerId/category-evolution')
  @ApiOperation({
    summary: 'Category evolution report for a ledger',
    description:
      'Returns nominal amounts, CPI-adjusted real amounts, and percentage share per category per period. ' +
      'Replicates the Excel Evolución Gastos table including both the nominal and share heat-map views.',
  })
  @ApiParam({ name: 'ledgerId', type: Number, description: 'ID of the ledger' })
  @ApiQuery({
    name: 'from',
    type: String,
    required: true,
    description: 'Start of period range (YYYY-MM)',
    example: '2025-07',
  })
  @ApiQuery({
    name: 'to',
    type: String,
    required: true,
    description: 'End of period range (YYYY-MM)',
    example: '2026-02',
  })
  @ApiOkResponse({ type: CategoryEvolutionReportDto })
  @ApiNotFoundResponse({ description: 'Ledger not found' })
  getCategoryEvolution(
    @Param('ledgerId', ParseIntPipe) ledgerId: number,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<CategoryEvolutionReportDto> {
    return this.reportsService.getCategoryEvolution(ledgerId, from, to);
  }
}
