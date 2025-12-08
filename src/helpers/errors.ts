import { NotFoundException } from '@nestjs/common';
import { Prisma } from 'prisma/generated/prisma/client';

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
