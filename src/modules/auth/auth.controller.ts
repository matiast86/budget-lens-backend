import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/decorators/public/public.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { SignInResponseDto } from './dto/sign-in-response.dto';
import { SignInAuthDto } from './dto/signIn-auth.dto';

@Public()
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
  async signIn(@Body() credentials: SignInAuthDto): Promise<SignInResponseDto> {
    return await this.authService.signIn(credentials);
  }
}
