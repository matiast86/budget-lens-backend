import { ApiProperty } from '@nestjs/swagger';
import { UserDashboardViewDto } from 'src/modules/users/dto/user-dashboard-view.dto';

export class SignInResponseDto {
  @ApiProperty({
    description:
      'JWT access token to be sent as Bearer in Authorization header.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    type: () => UserDashboardViewDto,
    description: 'Authenticated user with their ledgers.',
  })
  user: UserDashboardViewDto;

  constructor(partial: Partial<SignInResponseDto>) {
    Object.assign(this, partial);
  }
}
