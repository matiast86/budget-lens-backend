import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { SignInAuthDto } from './dto/signIn-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @Post('signup')
  @HttpCode(201)
  async signUp(@Body() createUserDto: CreateUserDto) {
    const newUser = await this.authService.signUp(createUserDto);
    return {
      message: 'Registration successful',
      user: newUser,
    };
  }

  @ApiOperation({ summary: 'Authenticate user and generate token' })
  @Post('signin')
  @HttpCode(200)
  async signIn(@Body() credentials: SignInAuthDto) {
    return await this.authService.signIn(credentials);
  }
}
