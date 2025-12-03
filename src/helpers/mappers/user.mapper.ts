import { User } from '@prisma/client';
import { UserDashboardViewDto } from 'src/modules/users/dto/user-dashboard-view.dto';
import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';
import { UserDashboardView } from 'src/types/entities/user.types';
import { ledgerDashboardArrayToArrayDto } from './ledger.mapper';

export const userToDashboardResponseDto = (
  user: UserDashboardView,
): UserDashboardViewDto => {
  const {
    id,
    name,
    email,
    birthDate,
    gender,
    role,
    ledgers,
    isActive,
    createdAt,
    updatedAt,
  } = user;

  return new UserDashboardViewDto({
    id,
    name,
    email,
    birthDate: birthDate.toISOString(),
    gender,
    role,
    ledgers: ledgers ? ledgerDashboardArrayToArrayDto(ledgers) : [],
    isActive,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  });
};

export const userToResponseDto = (user: User): UserResponseDto => {
  const {
    id,
    name,
    email,
    birthDate,
    gender,
    role,
    isActive,
    createdAt,
    updatedAt,
  } = user;
  return new UserResponseDto({
    id,
    name,
    email,
    birthDate: birthDate.toISOString(),
    gender,
    role,
    isActive,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  });
};
