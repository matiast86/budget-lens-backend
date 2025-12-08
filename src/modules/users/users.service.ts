import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'bcrypt';
import { Prisma, User } from 'prisma/generated/prisma/client';
import { userToResponseDto } from 'src/helpers/mappers/user.mapper';
import { UserDashboardView } from 'src/types/entities/user.types';
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

    const password: string = await hash(rawPassword, 10);

    const data: Prisma.UserCreateInput = {
      name,
      email,
      birthDate,
      password,
      gender,
    };
    const newUser: User = await this.usersRepository.create(data);

    return userToResponseDto(newUser);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users: User[] = await this.usersRepository.getAllUsers();

    return users.map((user) => userToResponseDto(user));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user: User | null = await this.usersRepository.getUserById(id);
    if (!user) throw new NotFoundException(`User with id: ${id} not found.`);

    return userToResponseDto(user);
  }

  async findOneByEmail(email: string): Promise<UserDashboardView> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user)
      throw new NotFoundException(`User with email: ${email} not found.`);

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const data: Prisma.UserUpdateInput = updateUserDto;
    const updatedUser: User = await this.usersRepository.update(id, data);
    return userToResponseDto(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const data: Prisma.UserUpdateInput = { isActive: false };
    await this.usersRepository.update(id, data);
  }
}
