import { Injectable, NotFoundException } from '@nestjs/common';
import { Ledger, Prisma } from 'prisma/generated/prisma/client';
import {
  ledgerDashboardArrayToArrayDto,
  ledgerToDashboardView,
  ledgerToDetailsResponseDto,
  minimumLedgerToDashboardResponseDto,
} from 'src/helpers/mappers/ledger.mapper';
import { LedgerDashboardView } from 'src/types/entities/ledger.types';
import { CategoryTemplatesService } from '../category-templates/category-templates.service';
import { InflationIndexesService } from '../inflation-indexes/inflation-indexes.service';
import { PaymentMethodsService } from '../payment-methods/payment-methods.service';
import { CreateLedgerDto } from './dto/create-ledger.dto';
import { LedgerDashboardResponseDto } from './dto/ledger-dashboard-response.dto';
import { LedgerMinimalDto } from './dto/ledger-minimal.dto';
import { LedgerResponseDto } from './dto/ledger-response.dto';
import { UpdateLedgerDto } from './dto/update-ledger.dto';
import { LedgersRepository } from './ledgers.repository';

@Injectable()
export class LedgersService {
  constructor(
    private readonly ledgersRepository: LedgersRepository,
    private readonly paymentMethodsService: PaymentMethodsService,
    private readonly templatesService: CategoryTemplatesService,
    private readonly inflationIndexesService: InflationIndexesService,
  ) {}

  async create(
    ownerId: string,
    dto: CreateLedgerDto,
  ): Promise<LedgerDashboardResponseDto> {
    const { name, description, currency } = dto;

    const templates = await this.templatesService.findAll();
    const categoriesData = templates.map((t) => ({
      name: t.name,
      description: t.description ?? undefined,
      templateId: t.id,
    }));

    const now = new Date();
    const currentPeriod = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const baseCpiIndex =
      (await this.inflationIndexesService.getCpiIndex(
        currency,
        currentPeriod,
      )) ?? 100;

    const data: Prisma.LedgerCreateInput = {
      name,
      description,
      currency,
      baseCpiIndex,
      owner: { connect: { id: ownerId } },
      categories: { createMany: { data: categoriesData } },
    };

    const newLedger = await this.ledgersRepository.create(data);
    await this.paymentMethodsService.addToLedger(ownerId, newLedger.id);

    return ledgerToDashboardView(newLedger);
  }

  async findLedgersByOwner(
    ownerId: string,
    skip: number,
    take: number,
  ): Promise<LedgerDashboardResponseDto[]> {
    const where: Prisma.LedgerWhereInput = { ownerId, isActive: true };
    const ledgers: LedgerDashboardView[] =
      await this.ledgersRepository.findAllPaginated(skip, take, where);

    return ledgerDashboardArrayToArrayDto(ledgers);
  }

  async findOne(id: number): Promise<LedgerResponseDto> {
    const ledger = await this.ledgersRepository.findLedgerById(id);
    if (!ledger)
      throw new NotFoundException(`Ledger with id: ${id} not found.`);

    return ledgerToDetailsResponseDto(ledger);
  }

  async findOneMinimal(id: number): Promise<LedgerMinimalDto> {
    const ledger = await this.ledgersRepository.findOneMinimal(id);
    if (!ledger)
      throw new NotFoundException(`Ledger with id: ${id} not found.`);
    return new LedgerMinimalDto({
      id: ledger.id,
      currency: ledger.currency,
      baseCpiIndex: Number(ledger.baseCpiIndex),
    });
  }

  async update(
    id: number,
    updateLedgerDto: UpdateLedgerDto,
  ): Promise<LedgerDashboardResponseDto> {
    const data: Prisma.LedgerUpdateInput = { ...updateLedgerDto };
    const updated = await this.ledgersRepository.update(id, data);

    return ledgerToDashboardView(updated);
  }

  async deactivate(id: number): Promise<void> {
    const data: Partial<Ledger> = { isActive: false };
    await this.ledgersRepository.update(id, data);
  }

  async remove(id: number): Promise<void> {
    await this.ledgersRepository.remove(id);
  }

  async getEntityById(id: number): Promise<LedgerResponseDto | undefined> {
    const ledger = await this.ledgersRepository.findEntityById(id);

    return ledger ? minimumLedgerToDashboardResponseDto(ledger) : undefined;
  }
}
