export class CreateDebtOwnerDto {
  name: string;
  constructor(partial: Partial<CreateDebtOwnerDto>) {
    Object.assign(this, partial);
  }
}
