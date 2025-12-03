import { Module } from '@nestjs/common';
import { LedgersModule } from '../ledgers/ledgers.module';
import { DebtOwnersController } from './debt-owners.controller';
import { DebtOwnersRepository } from './debt-owners.repository';
import { DebtOwnersService } from './debt-owners.service';

@Module({
  imports: [LedgersModule],
  controllers: [DebtOwnersController],
  providers: [DebtOwnersService, DebtOwnersRepository],
  exports: [DebtOwnersService],
})
export class DebtOwnersModule {}
