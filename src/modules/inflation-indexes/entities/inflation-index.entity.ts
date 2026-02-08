export class InflationIndexEntity {
  id: number;
  period: Date;
  monthlyRate: number;
  cpiIndex: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<InflationIndexEntity>) {
    Object.assign(this, partial);
  }
}
