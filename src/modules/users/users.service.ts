import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { hash } from 'bcrypt';
import {
  userEntityToResponseDto,
  userToEntity,
} from 'src/helpers/mappers/user.mapper';
import { UserWithRelations } from 'src/types/entities/entities-with-relations';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { name, email, birthDate, rawPassword, repeatPassword, gender } =
      createUserDto;

    if (rawPassword != repeatPassword)
      throw new BadRequestException('Passwords do not match.');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const password: string = await hash(rawPassword, 10);

    const data: Prisma.UserCreateInput = {
      name,
      email,
      birthDate,
      password,
      gender,
    };
    const newUser: UserWithRelations = await this.usersRepository.create(data);

    return userEntityToResponseDto(userToEntity(newUser));
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users: UserWithRelations[] = await this.usersRepository.getAllUsers();

    return users.map((user) => userEntityToResponseDto(userToEntity(user)));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user: UserWithRelations = await this.usersRepository.getUserById(id);

    return userEntityToResponseDto(userToEntity(user));
  }

  async findOneById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.getUserById(id);
    return userEntityToResponseDto(userToEntity(user));
  }

  async findOneByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findByEmail(email);
    return userEntityToResponseDto(userToEntity(user));
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const data: Prisma.UserUpdateInput = updateUserDto;
    const updatedUser: UserWithRelations = await this.usersRepository.update(
      id,
      data,
    );
    return userEntityToResponseDto(userToEntity(updatedUser));
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.getUserById(id);
    const data: Prisma.UserUpdateInput = { isActive: false };
    await this.usersRepository.update(id, data);
  }
}
