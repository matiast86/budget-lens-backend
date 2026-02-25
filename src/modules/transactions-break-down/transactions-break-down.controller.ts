import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionBreakDownResponseDto } from './dto/transaction-break-down-response.dto';
import { UpdateTransactionsBreakDownDto } from './dto/update-transactions-break-down.dto';
import { TransactionsBreakDownService } from './transactions-break-down.service';

@ApiBearerAuth()
@ApiTags('Transactions Break Down')
@Controller('transactions-break-down')
export class TransactionsBreakDownController {
  constructor(
    private readonly transactionsBreakDownService: TransactionsBreakDownService,
  ) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Update a weekly breakdown entry' })
  @ApiParam({ name: 'id', type: Number, description: 'Breakdown record ID' })
  @ApiOkResponse({ type: TransactionBreakDownResponseDto })
  @ApiNotFoundResponse({ description: 'Breakdown record not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTransactionsBreakDownDto,
  ): Promise<TransactionBreakDownResponseDto> {
    const updated = await this.transactionsBreakDownService.update(
      id,
      updateDto,
    );
    return new TransactionBreakDownResponseDto({
      id: updated.id,
      transactionId: updated.transactionId,
      weekNumber: updated.weekNumber,
      amount: Number(updated.amount),
    });
  }
}
