import { Injectable } from '@nestjs/common';
import { InflationIndexesRepository } from './inflation-indexes.repository';

@Injectable()
export class InflationIndexesService {
  constructor(
    private readonly inflationIndexesRepository: InflationIndexesRepository,
  ) {}
}
