import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TransactionsBreakDownService } from './transactions-break-down.service';
import { CreateTransactionsBreakDownDto } from './dto/create-transactions-break-down.dto';
import { UpdateTransactionsBreakDownDto } from './dto/update-transactions-break-down.dto';

@Controller('transactions-break-down')
export class TransactionsBreakDownController {
  constructor(private readonly transactionsBreakDownService: TransactionsBreakDownService) {}

  @Post()
  create(@Body() createTransactionsBreakDownDto: CreateTransactionsBreakDownDto) {
    return this.transactionsBreakDownService.create(createTransactionsBreakDownDto);
  }

  @Get()
  findAll() {
    return this.transactionsBreakDownService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsBreakDownService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransactionsBreakDownDto: UpdateTransactionsBreakDownDto) {
    return this.transactionsBreakDownService.update(+id, updateTransactionsBreakDownDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionsBreakDownService.remove(+id);
  }
}
