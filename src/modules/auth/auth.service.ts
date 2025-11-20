import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import {
  userEntityToResponseDto,
  userToEntity,
} from 'src/helpers/mappers/user.mapper';
import { UserWithRelations } from 'src/types/entities/entities-with-relations';
import { JwtPayload } from 'src/types/payload/payload';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UsersService } from '../users/users.service';
import { SignInAuthDto } from './dto/signIn-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return await this.usersService.create(createUserDto);
  }

  async signIn(credentials: SignInAuthDto) {
    const { email, password } = credentials;

    try {
      const user: UserWithRelations =
        await this.usersService.findOneByEmail(email);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const isPasswordMatching = await compare(password, user.password);

      if (!isPasswordMatching) {
        throw new Error();
      }

      const payload: JwtPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      const token = await this.jwtService.signAsync(payload);

      const safeUser = userEntityToResponseDto(userToEntity(user));

      return { token, user: safeUser };
    } catch (e) {
      console.error('SIGNIN ERROR:', e);
      throw new HttpException(
        'Email or password do not match.',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
