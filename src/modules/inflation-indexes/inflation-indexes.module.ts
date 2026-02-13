import { Module } from '@nestjs/common';
import { InflationIndexesController } from './inflation-indexes.controller';
import { InflationIndexesRepository } from './inflation-indexes.repository';
import { InflationIndexesService } from './inflation-indexes.service';

@Module({
  controllers: [InflationIndexesController],
  providers: [InflationIndexesService, InflationIndexesRepository],
  exports: [InflationIndexesService],
})
export class InflationIndexesModule {}
