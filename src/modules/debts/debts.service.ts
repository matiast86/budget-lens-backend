import { Injectable, NotFoundException } from '@nestjs/common';
import { DebtUpdateInput } from 'prisma/generated/prisma/models';
import { parsePeriod } from 'src/helpers/dates';
import {
  debtArrayToArrayDto,
  debtToResponseDto,
} from 'src/helpers/mappers/debt.mapper';
import { DebtsRepository } from './debts.repository';
import { DebtResponseDto } from './dto/debt-response.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';

@Injectable()
export class DebtsService {
  constructor(private readonly debtsRepository: DebtsRepository) {}

  async findAllByOwnerId(
    ownerId: number,
    skip: number,
    take: number,
  ): Promise<DebtResponseDto[]> {
    const debtOwner = await this.debtsRepository.findAllByOwnerId(
      ownerId,
      skip,
      take,
    );
    const debts = debtOwner.map((t) => t.debt);
    return debtArrayToArrayDto(debts);
  }

  async findOneById(id: number): Promise<DebtResponseDto> {
    const debt = await this.debtsRepository.findById(id);
    if (!debt) throw new NotFoundException(`Debt with id:  ${id} not found.`);
    return debtToResponseDto(debt);
  }

  async update(
    id: number,
    updateDebtDto: UpdateDebtDto,
  ): Promise<DebtResponseDto> {
    const { periodString, ...res } = updateDebtDto;
    const data: DebtUpdateInput = {
      ...res,
      ...(periodString && { period: parsePeriod(periodString) }),
    };
    const updated = await this.debtsRepository.update(id, data);
    return debtToResponseDto(updated);
  }

  async remove(id: number): Promise<void> {
    await this.debtsRepository.delete(id);
  }

  async findEntityById(id: number): Promise<DebtResponseDto | undefined> {
    const debt = await this.debtsRepository.findById(id);
    return debt ? debtToResponseDto(debt) : undefined;
  }
}
