import { Controller } from '@nestjs/common';
import { InflationIndexesService } from './inflation-indexes.service';

@Controller('inflation-indexes')
export class InflationIndexesController {
  constructor(
    private readonly inflationIndexesService: InflationIndexesService,
  ) {}
}
