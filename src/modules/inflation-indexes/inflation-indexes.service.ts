import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Currency, Prisma } from 'prisma/generated/prisma/browser';
import { InflationIndexUpdateInput } from 'prisma/generated/prisma/models';
import { parsePeriod } from 'src/helpers/dates';
import {
  inflationIndexArrayToArrayDto,
  inflationIndexToResponseDto,
} from 'src/helpers/mappers/inflation-index.mapper';
import { CreateInflationIndexDto } from './dto/create-inflation-index.dto';
import { InflationIndexResponseDto } from './dto/inflation-index-response.dto';
import { UpdateInflationIndexDto } from './dto/update-inflation-index.dto';
import { InflationIndexesRepository } from './inflation-indexes.repository';

@Injectable()
export class InflationIndexesService {
  constructor(
    private readonly inflationIndexesRepository: InflationIndexesRepository,
  ) {}

  private parsedOrderBy(
    orderBy?: string,
  ): Prisma.InflationIndexOrderByWithRelationInput | undefined {
    if (!orderBy) return undefined;
    const [field, dirRaw] = orderBy.split(':');
    const allowedFields = ['period', 'cpiIndex'] as const;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!allowedFields.includes(field as any)) {
      throw new BadRequestException('Invalid sort field');
    }
    const direction = dirRaw === 'desc' ? 'desc' : 'asc'; // or throw if dirRaw && not valid
    return { [field]: direction };
  }

  async create(
    dto: CreateInflationIndexDto,
  ): Promise<InflationIndexResponseDto> {
    const { currency, periodString, monthlyRate, cpiIndex } = dto;
    const index = await this.inflationIndexesRepository.create({
      currency,
      period: parsePeriod(periodString),
      monthlyRate,
      cpiIndex,
    });
    return inflationIndexToResponseDto(index);
  }

  async findMany(
    currency: Currency,
    skip: number,
    take: number,
    startPeriod?: string,
    endPeriod?: string,
    orderBy?: string,
  ): Promise<InflationIndexResponseDto[]> {
    const order = this.parsedOrderBy(orderBy);
    const where: Prisma.InflationIndexWhereInput = {
      currency,
      period: {
        ...(startPeriod && { gte: parsePeriod(startPeriod) }),
        ...(endPeriod && { lte: parsePeriod(endPeriod) }),
      },
    };
    const indexes = await this.inflationIndexesRepository.findManyPaginated(
      where,
      skip,
      take,
      order,
    );

    return inflationIndexArrayToArrayDto(indexes);
  }

  async findById(id: number): Promise<InflationIndexResponseDto> {
    const index = await this.inflationIndexesRepository.findById(id);
    if (!index) throw new NotFoundException(`Index with id: ${id} not found.`);
    return inflationIndexToResponseDto(index);
  }

  async findByCurrencyAndPeriod(
    currency: Currency,
    period: Date,
  ): Promise<InflationIndexResponseDto> {
    const index = await this.inflationIndexesRepository.findByCurrencyAndPeriod(
      currency,
      period,
    );
    if (!index) throw new NotFoundException(`Index not found.`);
    return inflationIndexToResponseDto(index);
  }

  async update(
    id: number,
    updateInflationIndexDto: UpdateInflationIndexDto,
  ): Promise<InflationIndexResponseDto> {
    const { periodString, ...res } = updateInflationIndexDto;
    const data: InflationIndexUpdateInput = {
      ...res,
      ...(periodString && { period: parsePeriod(periodString) }),
    };

    const updated = await this.inflationIndexesRepository.update(id, data);
    return inflationIndexToResponseDto(updated);
  }

  async delete(id: number): Promise<void> {
    await this.inflationIndexesRepository.delete(id);
  }

  // Returns the CPI index for a given currency + period, or null if not found.
  // Used by TransactionsService to calculate inflation-adjusted amounts
  // without failing when CPI data is missing.
  async getCpiIndex(currency: Currency, period: Date): Promise<number | null> {
    const index = await this.inflationIndexesRepository.findByCurrencyAndPeriod(
      currency,
      period,
    );
    return index ? Number(index.cpiIndex) : null;
  }
}
