import { DebtResponseDto } from './debt-response.dto';

export class DebtResponseWithOwnerIdDto {
  debtResponseDto: DebtResponseDto;
  ownerId: number;

  constructor(partial: Partial<DebtResponseWithOwnerIdDto>) {
    Object.assign(this, partial);
  }
}
