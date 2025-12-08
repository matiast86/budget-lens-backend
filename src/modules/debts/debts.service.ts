import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/generated/prisma/client';
import { parsePeriod } from 'src/helpers/dates';
import { handleP2025 } from 'src/helpers/errors';
import {
  debtArrayToArrayDto,
  debtToResponseDto,
} from 'src/helpers/mappers/debt.mapper';
import { DebtOwnersService } from '../debt-owners/debt-owners.service';
import { DebtsRepository } from './debts.repository';
import { CreateDebtDto } from './dto/create-debt.dto';
import { DebtResponseDto } from './dto/debt-response.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';

@Injectable()
export class DebtsService {
  constructor(
    private readonly debtsRepository: DebtsRepository,
    private readonly debtOwnersService: DebtOwnersService,
  ) {}

  async create(
    ownerId: number,
    createDebtDto: CreateDebtDto,
  ): Promise<DebtResponseDto> {
    const { direction, amount, periodString } = createDebtDto;
    await this.debtOwnersService
      .findById(ownerId)
      .catch(handleP2025(`Owner with id: ${ownerId} not found`));

    //convert period string in format YYYY-MM to date
    const period = parsePeriod(periodString);
    const debt = await this.debtsRepository.create({
      direction,
      amount,
      period,
      debtOwner: { connect: { id: ownerId } },
    });
    return debtToResponseDto(debt);
  }

  async findAllByOwnerId(
    ownerId: number,
    skip: number,
    take: number,
    orderBy: Prisma.DebtOrderByWithRelationInput,
  ): Promise<DebtResponseDto[]> {
    const debts = await this.debtsRepository.findAllByOwnerId(
      ownerId,
      skip,
      take,
      orderBy,
    );
    return debtArrayToArrayDto(debts);
  }

  async findOneById(id: number): Promise<DebtResponseDto> {
    const debt = await this.debtsRepository.findById(id);
    return debtToResponseDto(debt);
  }

  async update(
    id: number,
    updateDebtDto: UpdateDebtDto,
  ): Promise<DebtResponseDto> {
    return await this.debtsRepository
      .update(id, {
        ...updateDebtDto,
      })
      .catch(handleP2025(`Debt with id: ${id} not found`))
      .then(debtToResponseDto);
  }

  async remove(id: number): Promise<void> {
    await this.debtsRepository
      .delete(id)
      .catch(handleP2025(`Debt with id: ${id} not found`));
  }
}
