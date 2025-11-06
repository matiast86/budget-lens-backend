import { Module } from '@nestjs/common';
import { LedgersService } from './ledgers.service';
import { LedgersController } from './ledgers.controller';

@Module({
  controllers: [LedgersController],
  providers: [LedgersService],
})
export class LedgersModule {}
