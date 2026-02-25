import { Injectable, NotFoundException } from '@nestjs/common';
import { DebtUpdateInput } from 'prisma/generated/prisma/models';
import { parsePeriod } from 'src/helpers/dates';
import {
  debtArrayToArrayDto,
  debtToResponseDto,
} from 'src/helpers/mappers/debt.mapper';
import { DebtsRepository } from './debts.repository';
import { DebtResponseWithOwnerIdDto } from './dto/debt-response-with-owner.dto';
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
    const debts = await this.debtsRepository.findAllByOwnerId(
      ownerId,
      skip,
      take,
    );

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

  async findDebtWithOwnerId(
    id: number,
  ): Promise<DebtResponseWithOwnerIdDto | undefined> {
    const debt = await this.debtsRepository.findWithOwnerById(id);
    if (debt) {
      const debtResponseDto = debtToResponseDto(debt);
      const ownerId = debt.transactionDebtOwner?.debtOwnerId;
      return new DebtResponseWithOwnerIdDto({ debtResponseDto, ownerId });
    }

    return undefined;
  }
}
