import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DebtOwnersService } from './debt-owners.service';
import { CreateDebtOwnerDto } from './dto/create-debt-owner.dto';
import { UpdateDebtOwnerDto } from './dto/update-debt-owner.dto';

@Controller('debt-owners')
export class DebtOwnersController {
  constructor(private readonly debtOwnersService: DebtOwnersService) {}

  @Post()
  create(@Body() createDebtOwnerDto: CreateDebtOwnerDto) {
    return this.debtOwnersService.create(createDebtOwnerDto);
  }

  @Get()
  findAll() {
    return this.debtOwnersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.debtOwnersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDebtOwnerDto: UpdateDebtOwnerDto) {
    return this.debtOwnersService.update(+id, updateDebtOwnerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.debtOwnersService.remove(+id);
  }
}
