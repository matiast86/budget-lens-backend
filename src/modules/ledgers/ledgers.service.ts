import { Injectable } from '@nestjs/common';
import { Ledger, Prisma } from '@prisma/client';
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
    createLedgerDto: CreateLedgerDto,
  ): Promise<LedgerResponseDto> {
    const { name, description } = createLedgerDto;
    const owner = await this.usersService.findOne(ownerId);
    const data: Prisma.LedgerCreateInput = {
      name,
      description,
      owner: { connect: { id: ownerId } },
    };
    const newLedger = await this.ledgersRepository.create(data);
    owner.ledgers.push(newLedger);

    return new LedgerResponseDto(newLedger);
  }

  async findAll() {
    const ledgers: Ledger[] = await this.ledgersRepository.findAll();
    return ledgers.map((ledger) => new LedgerResponseDto(ledger));
  }

  async findLedgersByOwner(
    ownerId: string,
    skip: number = 0,
    take: number = 10,
  ): Promise<LedgerResponseDto[]> {
    const where: Prisma.LedgerWhereInput = { ownerId };
    const ledgers: Ledger[] = await this.ledgersRepository.findAllPaginated(
      skip,
      take,
      where,
    );

    return ledgers.map((ledger) => new LedgerResponseDto(ledger));
  }

  async findOne(id: number): Promise<Ledger> {
    return await this.ledgersRepository.findLedgerById(id);
  }

  async update(id: number, updateLedgerDto: UpdateLedgerDto): Promise<Ledger> {
    await this.ledgersRepository.findLedgerById(id);
    const data: Partial<Ledger> = updateLedgerDto;
    return await this.ledgersRepository.update(id, data);
  }

  async deactivate(id: number): Promise<void> {
    await this.ledgersRepository.findLedgerById(id);
    const data: Partial<Ledger> = { isActive: false };
    await this.ledgersRepository.update(id, data);
  }

  async delete(id: number): Promise<void> {
    await this.ledgersRepository.findLedgerById(id);
    await this.ledgersRepository.delete(id);
  }
}
