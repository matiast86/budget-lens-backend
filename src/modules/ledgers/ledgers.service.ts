import { Injectable, NotFoundException } from '@nestjs/common';
import { Ledger, Prisma } from 'prisma/generated/prisma/client';
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
    await this.usersService.findOne(ownerId);
    const where: Prisma.LedgerWhereInput = { ownerId, isActive: true };
    const ledgers: LedgerDashboardView[] =
      await this.ledgersRepository.findAllPaginated(skip, take, where);

    return ledgerDashboardArrayToArrayDto(ledgers);
  }

  async findOne(userId: string, id: number): Promise<LedgerResponseDto> {
    const ledger = await this.ledgersRepository.findLedgerById(id);
    if (!ledger)
      throw new NotFoundException(`Ledger with id: ${id} not found.`);
    const collaborations = ledger.collaborations ?? [];
    const collaboration = collaborations.some((c) => c.userId === userId);
    if (ledger.ownerId != userId && !collaboration)
      throw new NotFoundException(
        `Only owners and collaborators may access this ledger.`,
      );
    return ledgerToDetailsResponseDto(ledger);
  }

  async update(
    id: number,
    userId: string,
    updateLedgerDto: UpdateLedgerDto,
  ): Promise<LedgerDashboardResponseDto> {
    const ledger = await this.ledgersRepository.findLedgerById(id);
    if (!ledger)
      throw new NotFoundException(`Ledger with id: ${id} not found.`);
    const collaborations = ledger.collaborations ?? [];
    const collaboration = collaborations.some((c) => c.userId === userId);
    if (ledger.ownerId != userId && !collaboration)
      throw new NotFoundException(
        `Only owners and collaborators may modify this ledger.`,
      );

    const data: Prisma.LedgerUpdateInput = { ...updateLedgerDto };
    const updated = await this.ledgersRepository.update(id, data);

    return ledgerToDashboardView(updated);
  }

  async deactivate(id: number, userId: string): Promise<void> {
    const ledger = await this.ledgersRepository.findLedgerById(id);
    if (!ledger)
      throw new NotFoundException(`Ledger with id: ${id} not found.`);
    const collaborations = ledger.collaborations ?? [];
    const collaboration = collaborations.some((c) => c.userId === userId);
    if (ledger.ownerId != userId && !collaboration)
      throw new NotFoundException(
        `Only owners and collaborators may modify this ledger.`,
      );
    const data: Partial<Ledger> = { isActive: false };
    await this.ledgersRepository.update(id, data);
  }

  async remove(userId: string, id: number): Promise<void> {
    const ledger = await this.ledgersRepository.findLedgerById(id);
    if (!ledger)
      throw new NotFoundException(`Ledger with id: ${id} not found.`);
    const collaborations = ledger.collaborations ?? [];
    const collaboration = collaborations.some((c) => c.userId === userId);
    if (ledger.ownerId != userId && !collaboration)
      throw new NotFoundException(
        `Only owners and collaborators may modify this ledger.`,
      );
    await this.ledgersRepository.remove(id);
  }

  async getEntityById(id: number): Promise<LedgerResponseDto | undefined> {
    const ledger = await this.ledgersRepository.findLedgerById(id);

    return ledger ? ledgerToDetailsResponseDto(ledger) : undefined;
  }
}
