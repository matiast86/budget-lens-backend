import { Injectable } from '@nestjs/common';
import { Ledger, Prisma } from '@prisma/client';
import {
  ledgerArrayToArrayDto,
  ledgerEntityToResponseDto,
  ledgerToEntity,
} from 'src/helpers/mappers/ledger.mapper';
import { LedgerWithRelations } from 'src/types/entities/entities-with-relations';
import { UsersService } from '../users/users.service';
import { CreateLedgerDto } from './dto/create-ledger.dto';
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
  ): Promise<LedgerResponseDto> {
    await this.usersService.findOne(ownerId);

    const data: Prisma.LedgerCreateInput = {
      name: dto.name,
      description: dto.description,
      owner: { connect: { id: ownerId } },
    };

    const newLedger = await this.ledgersRepository.create(data);

    return ledgerEntityToResponseDto(ledgerToEntity(newLedger));
  }

  async findAll() {
    const ledgers: LedgerWithRelations[] =
      await this.ledgersRepository.findAll();
    return ledgerArrayToArrayDto(ledgers.map(ledgerToEntity));
  }

  async findLedgersByOwner(
    ownerId: string,
    skip: number,
    take: number,
  ): Promise<LedgerResponseDto[]> {
    const where: Prisma.LedgerWhereInput = { ownerId };
    const ledgers: LedgerWithRelations[] =
      await this.ledgersRepository.findAllPaginated(skip, take, where);

    return ledgerArrayToArrayDto(ledgers.map(ledgerToEntity));
  }

  async findOne(id: number): Promise<LedgerResponseDto> {
    const ledger = await this.ledgersRepository.findLedgerById(id);
    return ledgerEntityToResponseDto(ledgerToEntity(ledger));
  }

  async update(
    id: number,
    updateLedgerDto: UpdateLedgerDto,
  ): Promise<LedgerResponseDto> {
    await this.ledgersRepository.findLedgerById(id);

    const data: Prisma.LedgerUpdateInput = { ...updateLedgerDto };
    const updated = await this.ledgersRepository.update(id, data);

    return ledgerEntityToResponseDto(ledgerToEntity(updated));
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
