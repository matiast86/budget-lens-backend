import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { LedgersController } from './ledgers.controller';
import { LedgersRepository } from './ledgers.repository';
import { LedgersService } from './ledgers.service';

@Module({
  imports: [UsersModule],
  controllers: [LedgersController],
  providers: [LedgersService, LedgersRepository],
  exports: [LedgersService],
})
export class LedgersModule {}
