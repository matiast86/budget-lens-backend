import { UserDashboardViewDto } from 'src/modules/users/dto/user-dashboard-view.dto';

export class SignInResponseDto {
  token: string;
  user: UserDashboardViewDto;

  constructor(partial: Partial<SignInResponseDto>) {
    Object.assign(this, partial);
  }
}
