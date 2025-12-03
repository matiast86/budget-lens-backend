import { Injectable } from '@nestjs/common';
import { Ledger, Prisma } from '@prisma/client';
import {
  ledgerDashboardArrayToArrayDto,
  ledgerToDashboardView,
  ledgerToDetailsResponseDto,
} from 'src/helpers/mappers/ledger.mapper';
import { LedgerDashboardView } from 'src/types/entities/ledger.types';
import { UsersService } from '../users/users.service';
import { CreateLedgerDto } from './dto/create-ledger.dto';
import { LedgerDashboardResponseDto } from './dto/ledger-dashboard-response.dto';
import { LedgerResponseDto } from './dto/ledger-response.dto';
import { UpdateLedgerDto } from './dto/update-ledger.dto';
import { LedgersRepository } from './ledgers.repository';

@Injectable()
export class LedgersService {
  constructor(
    private readonly ledgersRepository: LedgersRepository,
    private readonly usersService: UsersService,
  ) {}

  async create(
    ownerId: string,
    dto: CreateLedgerDto,
  ): Promise<LedgerDashboardResponseDto> {
    await this.usersService.findOne(ownerId);

    const data: Prisma.LedgerCreateInput = {
      name: dto.name,
      description: dto.description,
      owner: { connect: { id: ownerId } },
    };

    const newLedger = await this.ledgersRepository.create(data);

    return ledgerToDashboardView(newLedger);
  }

  async findAll(ownerId: string) {
    await this.usersService.findOne(ownerId);
    const ledgers: LedgerDashboardView[] =
      await this.ledgersRepository.findAllByUserId(ownerId);
    return ledgerDashboardArrayToArrayDto(ledgers);
  }

  async findLedgersByOwner(
    ownerId: string,
    skip: number,
    take: number,
  ): Promise<LedgerDashboardResponseDto[]> {
    const where: Prisma.LedgerWhereInput = { ownerId };
    const ledgers: LedgerDashboardView[] =
      await this.ledgersRepository.findAllPaginated(skip, take, where);

    return ledgerDashboardArrayToArrayDto(ledgers);
  }

  async findOne(id: number): Promise<LedgerResponseDto> {
    const ledger = await this.ledgersRepository.findLedgerById(id);
    return ledgerToDetailsResponseDto(ledger);
  }

  async update(
    id: number,
    updateLedgerDto: UpdateLedgerDto,
  ): Promise<LedgerDashboardResponseDto> {
    await this.ledgersRepository.findLedgerById(id);

    const data: Prisma.LedgerUpdateInput = { ...updateLedgerDto };
    const updated = await this.ledgersRepository.update(id, data);

    return ledgerToDashboardView(updated);
  }

  async deactivate(id: number): Promise<void> {
    await this.ledgersRepository.findLedgerById(id);
    const data: Partial<Ledger> = { isActive: false };
    await this.ledgersRepository.update(id, data);
  }

  async remove(id: number): Promise<void> {
    await this.ledgersRepository.findLedgerById(id);
    await this.ledgersRepository.remove(id);
  }
}
