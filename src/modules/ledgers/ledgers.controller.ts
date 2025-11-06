import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LedgersService } from './ledgers.service';
import { CreateLedgerDto } from './dto/create-ledger.dto';
import { UpdateLedgerDto } from './dto/update-ledger.dto';

@Controller('ledgers')
export class LedgersController {
  constructor(private readonly ledgersService: LedgersService) {}

  @Post()
  create(@Body() createLedgerDto: CreateLedgerDto) {
    return this.ledgersService.create(createLedgerDto);
  }

  @Get()
  findAll() {
    return this.ledgersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ledgersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLedgerDto: UpdateLedgerDto) {
    return this.ledgersService.update(+id, updateLedgerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ledgersService.remove(+id);
  }
}
