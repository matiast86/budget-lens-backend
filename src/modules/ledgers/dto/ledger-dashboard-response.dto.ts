export class LedgerDashboardResponseDto {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  constructor(partial: Partial<LedgerDashboardResponseDto>) {
    Object.assign(this, partial);
  }
}
