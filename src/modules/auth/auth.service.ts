import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { userToDashboardResponseDto } from 'src/helpers/mappers/user.mapper';
import { JwtPayload } from 'src/types/payload/payload';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UsersService } from '../users/users.service';
import { SignInResponseDto } from './dto/sign-in-response.dto';
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

  async signIn(credentials: SignInAuthDto): Promise<SignInResponseDto> {
    const { email, password } = credentials;
    const unauthorized = new UnauthorizedException(
      'Email or password do not match.',
    );

    const user = await this.usersService.findOneByEmail(email).catch(() => {
      throw unauthorized;
    });

    if (!(await compare(password, user.password))) throw unauthorized;

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    const token = await this.jwtService.signAsync(payload);
    return new SignInResponseDto({
      token,
      user: userToDashboardResponseDto(user),
    });
  }
}
