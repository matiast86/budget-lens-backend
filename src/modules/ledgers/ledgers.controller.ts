import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { GetUser } from 'src/decorators/get-user/get-user.decorator';
import { CreateLedgerDto } from './dto/create-ledger.dto';
import { UpdateLedgerDto } from './dto/update-ledger.dto';
import { LedgersService } from './ledgers.service';

@Controller('ledgers')
export class LedgersController {
  constructor(private readonly ledgersService: LedgersService) {}

  @Post()
  async create(
    @Body() createLedgerDto: CreateLedgerDto,
    @GetUser('id') ownerId: string,
  ) {
    return await this.ledgersService.create(ownerId, createLedgerDto);
  }

  @Get()
  async findAll() {
    return await this.ledgersService.findAll();
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
