import { Module } from '@nestjs/common';
import { LedgersController } from './ledgers.controller';
import { LedgersRepository } from './ledgers.repository';
import { LedgersService } from './ledgers.service';

@Module({
  controllers: [LedgersController],
  providers: [LedgersService, LedgersRepository],
})
export class LedgersModule {}
