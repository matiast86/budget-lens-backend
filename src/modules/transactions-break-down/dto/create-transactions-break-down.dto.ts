export class CreateTransactionsBreakDownDto {
  weekNumber: number;
  amount: number;
  transactionId: number;
  constructor(partial: Partial<CreateTransactionsBreakDownDto>) {
    Object.assign(this, partial);
  }
}
