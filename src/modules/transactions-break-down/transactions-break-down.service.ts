import { Injectable } from '@nestjs/common';
import { CreateTransactionsBreakDownDto } from './dto/create-transactions-break-down.dto';
import { UpdateTransactionsBreakDownDto } from './dto/update-transactions-break-down.dto';

@Injectable()
export class TransactionsBreakDownService {
  create(createTransactionsBreakDownDto: CreateTransactionsBreakDownDto) {
    return 'This action adds a new transactionsBreakDown';
  }

  findAll() {
    return `This action returns all transactionsBreakDown`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transactionsBreakDown`;
  }

  update(id: number, updateTransactionsBreakDownDto: UpdateTransactionsBreakDownDto) {
    return `This action updates a #${id} transactionsBreakDown`;
  }

  remove(id: number) {
    return `This action removes a #${id} transactionsBreakDown`;
  }
}
