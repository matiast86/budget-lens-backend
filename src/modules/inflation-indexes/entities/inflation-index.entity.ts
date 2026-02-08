import { Currency } from 'prisma/generated/prisma/enums';

export class InflationIndexEntity {
  id: number;
  currency: Currency;
  period: Date;
  monthlyRate: number;
  cpiIndex: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<InflationIndexEntity>) {
    Object.assign(this, partial);
  }
}
