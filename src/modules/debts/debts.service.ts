import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'prisma/generated/prisma/client';
import { parsePeriod } from 'src/helpers/dates';
import {
  debtArrayToArrayDto,
  debtToResponseDto,
} from 'src/helpers/mappers/debt.mapper';
import { DebtOwnerResponseDto } from '../debt-owners/dto/debt-owner-response.dto';
import { DebtsRepository } from './debts.repository';
import { CreateDebtDto } from './dto/create-debt.dto';
import { DebtResponseDto } from './dto/debt-response.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';

@Injectable()
export class DebtsService {
  constructor(private readonly debtsRepository: DebtsRepository) {}
  private parsedOrderBy(
    orderBy?: string,
  ): Prisma.TransactionDebtOwnerOrderByWithRelationInput | undefined {
    if (!orderBy) return undefined;
    const [field, dirRaw] = orderBy.split(':');
    const allowedFields = ['amount', 'period', 'direction'] as const;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!allowedFields.includes(field as any)) {
      throw new BadRequestException('Invalid sort field');
    }
    const direction = dirRaw === 'desc' ? 'desc' : 'asc';
    if (field === 'period') return { debt: { period: direction } };
    return { [field]: direction };
  }

  async create(
    owner: DebtOwnerResponseDto,
    createDebtDto: CreateDebtDto,
  ): Promise<DebtResponseDto> {
    const { transactionId, direction, amount, periodString, description } =
      createDebtDto;

    //convert period string in format YYYY-MM to date
    const period = parsePeriod(periodString);
    const debt = await this.debtsRepository.create({
      period,
      description,
      transactionDebtOwner: {
        create: {
          transaction: { connect: { id: transactionId } },
          debtOwner: { connect: { id: owner.id } },
          amount,
          direction,
        },
      },
    });
    return debtToResponseDto(debt);
  }

  async findAllByOwnerId(
    ownerId: number,
    skip: number,
    take: number,
    orderBy?: string,
  ): Promise<DebtResponseDto[]> {
    const order = this.parsedOrderBy(orderBy);
    const debts = await this.debtsRepository.findAllByOwnerId(
      ownerId,
      skip,
      take,
      order,
    );
    return debtArrayToArrayDto(debts);
  }

  async findOneById(id: number): Promise<DebtResponseDto> {
    const debt = await this.debtsRepository.findById(id);
    if (!debt) {
      const orphan = await this.debtsRepository.findDebtOnlyById(id);
      if (orphan) {
        throw new BadRequestException(
          `Debt with id: ${id} is missing its split relation.`,
        );
      }
      throw new NotFoundException(`Debt with id:  ${id} not found.`);
    }
    return debtToResponseDto(debt);
  }

  async update(
    id: number,
    updateDebtDto: UpdateDebtDto,
  ): Promise<DebtResponseDto> {
    const { periodString, amount, direction, description } = updateDebtDto;
    const data: Prisma.DebtUpdateInput = {
      ...(description != undefined && { description }),
      ...(periodString && { period: parsePeriod(periodString) }),
    };
    const splitData: Prisma.TransactionDebtOwnerUpdateInput = {
      ...(amount != undefined && { amount }),
      ...(direction != undefined && { direction }),
    };
    const updated = await this.debtsRepository.update(id, data, splitData);
    return debtToResponseDto(updated);
  }

  async remove(id: number): Promise<void> {
    await this.debtsRepository.delete(id);
  }

  async findEntityById(id: number): Promise<DebtResponseDto | undefined> {
    const debt = await this.debtsRepository.findById(id);
    if (!debt) {
      const orphan = await this.debtsRepository.findDebtOnlyById(id);
      if (orphan) {
        throw new BadRequestException(
          `Debt with id: ${id} is missing its split relation.`,
        );
      }
      return undefined;
    }
    return debtToResponseDto(debt);
  }
}
