import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'prisma/generated/prisma/client';
import { DebtUpdateInput } from 'prisma/generated/prisma/models';
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
  ): Prisma.DebtOrderByWithRelationInput | undefined {
    if (!orderBy) return undefined;
    const [field, dirRaw] = orderBy.split(':');
    const allowedFields = ['amount', 'period', 'direction'] as const;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!allowedFields.includes(field as any)) {
      throw new BadRequestException('Invalid sort field');
    }
    const direction = dirRaw === 'desc' ? 'desc' : 'asc'; // or throw if dirRaw && not valid
    return { [field]: direction };
  }

  async create(
    owner: DebtOwnerResponseDto,
    createDebtDto: CreateDebtDto,
  ): Promise<DebtResponseDto> {
    const { direction, amount, periodString, description } = createDebtDto;

    //convert period string in format YYYY-MM to date
    const period = parsePeriod(periodString);
    const debt = await this.debtsRepository.create({
      direction,
      amount,
      period,
      description,
      debtOwner: { connect: { id: owner.id } },
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
