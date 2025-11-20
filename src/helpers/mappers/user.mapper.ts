import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { UserWithRelations } from 'src/types/entities/entities-with-relations';
import {
  collaborationArrayToArrayDto,
  collaborationToEntity,
} from './collaboration.mapper';
import {
  creditCardArrayToArrayDto,
  creditCardToEntity,
} from './credit-cards.mapper';
import { groupArrayToArrayDto, groupToEntity } from './group.mapper';
import { ledgerArrayToArrayDto, ledgerToEntity } from './ledger.mapper';

export const userToEntity = (user: UserWithRelations): UserEntity => {
  const {
    id,
    name,
    email,
    birthDate,
    password,
    gender,
    role,
    ledgers,
    collaborations,
    creditCards,
    groups,
    isActive,
    createdAt,
    updatedAt,
  } = user;

  return new UserEntity({
    id,
    name,
    email,
    birthDate,
    password,
    gender,
    role,
    ledgers: ledgers?.map(ledgerToEntity) ?? [],
    collaborations: collaborations?.map(collaborationToEntity) ?? [],
    creditCards: creditCards?.map(creditCardToEntity) ?? [],
    groups: groups?.map(groupToEntity) ?? [],
    isActive,
    createdAt,
    updatedAt,
  });
};

export const userEntityToResponseDto = (user: UserEntity): UserResponseDto => {
  const {
    id,
    name,
    email,
    birthDate,
    gender,
    role,
    ledgers,
    collaborations,
    creditCards,
    groups,
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
    creditCards: creditCardArrayToArrayDto(creditCards),
    groups: groupArrayToArrayDto(groups),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  });
};
