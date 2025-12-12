import { NotFoundException } from '@nestjs/common';
import { Prisma } from 'prisma/generated/prisma/client';
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
