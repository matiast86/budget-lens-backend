import { NotFoundException } from '@nestjs/common';
import { Prisma } from 'prisma/generated/prisma/client';
import { DebtOwnerResponseDto } from 'src/modules/debt-owners/dto/debt-owner-response.dto';
import { LedgerResponseDto } from 'src/modules/ledgers/dto/ledger-response.dto';
import { LedgerRequest } from 'src/modules/ledgers/entities/ledger-request';

export const handleP2025 = (message: string) => {
  return (error: any) => {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException(message);
    }
    throw error;
  };
};

export const handleLedgerFromRequest = (
  req: LedgerRequest,
): LedgerResponseDto => {
  const ledger = req.ledger;
  if (!ledger) throw new NotFoundException(`Ledger not found.`);
  return ledger;
};

export const handleDebtOwnerFromRequest = (
  req: LedgerRequest,
): DebtOwnerResponseDto => {
  const owner = req.debtOwner;
  if (!owner) throw new NotFoundException(`Debt Owner not found`);
  return owner;
};
