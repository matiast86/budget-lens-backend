import { Module } from '@nestjs/common';
import { DebtOwnersService } from './debt-owners.service';
import { DebtOwnersController } from './debt-owners.controller';

@Module({
  controllers: [DebtOwnersController],
  providers: [DebtOwnersService],
})
export class DebtOwnersModule {}
