import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { hash } from 'bcrypt';
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
    const newUser: User = await this.usersRepository.create(data);
    const response: Partial<UserResponseDto> = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      gender: newUser.gender,
      role: newUser.role,
      createdAt: newUser.createdAt.toISOString(),
      updatedAt: newUser.updatedAt.toISOString(),
    };
    return new UserResponseDto(response);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users: User[] = await this.usersRepository.getAllUsers();

    return users.map((user) => new UserResponseDto(user));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user: UserWithRelations = await this.usersRepository.getUserById(id);
    const ledgers = user.ledgers;

    const response: Partial<UserResponseDto> = {
      id: user.id,
      name: user.name,
      email: user.email,
      birthDate: user.birthDate.toISOString(),
      gender: user.gender,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toDateString(),
    };
    return new UserResponseDto(response);
  }

  async findOneById(id: string): Promise<User> {
    return await this.usersRepository.getUserById(id);
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.usersRepository.findByEmail(email);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const data: Partial<User> = updateUserDto;
    const updatedUser = await this.usersRepository.update(id, data);
    return new UserResponseDto(updatedUser);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.getUserById(id);
    const data: Partial<User> = { isActive: false };
    await this.usersRepository.update(id, data);
  }
}
