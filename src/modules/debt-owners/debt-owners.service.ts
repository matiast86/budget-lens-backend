import { Injectable } from '@nestjs/common';
import { CreateDebtOwnerDto } from './dto/create-debt-owner.dto';
import { UpdateDebtOwnerDto } from './dto/update-debt-owner.dto';

@Injectable()
export class DebtOwnersService {
  create(createDebtOwnerDto: CreateDebtOwnerDto) {
    return 'This action adds a new debtOwner';
  }

  findAll() {
    return `This action returns all debtOwners`;
  }

  findOne(id: number) {
    return `This action returns a #${id} debtOwner`;
  }

  update(id: number, updateDebtOwnerDto: UpdateDebtOwnerDto) {
    return `This action updates a #${id} debtOwner`;
  }

  remove(id: number) {
    return `This action removes a #${id} debtOwner`;
  }
}
