import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { UserWithRelations } from 'src/types/entities/entities-with-relations';

export const userToEntity = (user: UserWithRelations): Partial<UserEntity> => {
  const userEntity: Partial<UserEntity> = {
    id: user.id,
    name: user.name,
    email: user.email,
    birthDate: user.birthDate,
    password: user.password,
    gender: user.gender,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  return userEntity;
};

export const userEntityToResponseDto = (
  user: UserEntity,
): Partial<UserResponseDto> => {
  const response: Partial<UserResponseDto> = {
    id: user.id,
    name: user.name,
    email: user.email,
    birthDate: user.birthDate.toISOString(),
    gender: user.gender,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
  return response;
};
