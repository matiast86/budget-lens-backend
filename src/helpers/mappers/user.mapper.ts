import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';
import { UserWithRelations } from 'src/types/entities/entities-with-relations';
import { collaborationArrayToArrayDto } from './collaboration.mapper';
import { groupArrayToArrayDto } from './group.mapper';
import { ledgerArrayToArrayDto } from './ledger.mapper';
import { paymentMethodArrayToArrayDto } from './payment-method.mapper';

export const userToResponseDto = (user: UserWithRelations): UserResponseDto => {
  const {
    id,
    name,
    email,
    birthDate,
    gender,
    role,
    ledgers,
    collaborations,
    paymentMethods,
    groups,
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
    ledgers: ledgerArrayToArrayDto(ledgers),
    collaborations: collaborationArrayToArrayDto(collaborations),
    paymentMethods: paymentMethodArrayToArrayDto(paymentMethods),
    groups: groupArrayToArrayDto(groups),
    isActive,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  });
};
