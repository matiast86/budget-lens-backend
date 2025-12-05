import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'prisma/generated/prisma/client';
import {
  debtOwnerArrayToArrayDto,
  debtOwnerToResponseDto,
} from 'src/helpers/mappers/debt-owner.mapper';
import { DebtOwnersRepository } from './debt-owners.repository';
import { CreateDebtOwnerDto } from './dto/create-debt-owner.dto';
import { DebtOwnerResponseDto } from './dto/debt-owner-response.dto';
import { UpdateDebtOwnerDto } from './dto/update-debt-owner.dto';

@Injectable()
export class DebtOwnersService {
  constructor(private readonly debtOwnersRepository: DebtOwnersRepository) {}

  async create(
    ledgerId: number,
    createDebtOwnerDto: CreateDebtOwnerDto,
  ): Promise<DebtOwnerResponseDto> {
    const { name } = createDebtOwnerDto;
    const owner = await this.debtOwnersRepository.create({
      name,
      ledger: { connect: { id: ledgerId } },
    });

    return new DebtOwnerResponseDto({
      id: owner.id,
      name: owner.name,
      ledgerId: ledgerId,
    });
  }

  async findAll(
    skip: number,
    take: number,
    ledgerId: number,
  ): Promise<DebtOwnerResponseDto[]> {
    const owners = await this.debtOwnersRepository.findAllByLedgerId(
      skip,
      take,
      ledgerId,
    );
    return debtOwnerArrayToArrayDto(owners);
  }

  async findById(id: number): Promise<DebtOwnerResponseDto> {
    const owner = await this.debtOwnersRepository.findById(id);
    return debtOwnerToResponseDto(owner);
  }

  async findByNameInLedger(
    ledgerId: number,
    name: string,
  ): Promise<DebtOwnerResponseDto> {
    const owner = await this.debtOwnersRepository.findByNameInLedger(
      ledgerId,
      name,
    );
    return debtOwnerToResponseDto(owner);
  }

  async update(id: number, updateDebtOwnerDto: UpdateDebtOwnerDto) {
    try {
      const data: Prisma.DebtOwnerUpdateInput = { ...updateDebtOwnerDto };
      const updated = await this.debtOwnersRepository.update(id, data);
      return new DebtOwnerResponseDto({
        id: updated.id,
        name: updated.name,
        ledgerId: updated.ledgerId,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Debt owner with id: ${id} not found.`);
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.debtOwnersRepository.delete(id);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Debt owner with id: ${id} not found.`);
      }
      throw error;
    }
  }
}
