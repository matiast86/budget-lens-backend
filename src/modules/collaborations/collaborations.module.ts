import { Module } from '@nestjs/common';
import { LedgersModule } from '../ledgers/ledgers.module';
import { UsersModule } from '../users/users.module';
import { CollaborationsController } from './collaborations.controller';
import { CollaborationsService } from './collaborations.service';

@Module({
  imports: [UsersModule, LedgersModule],
  controllers: [CollaborationsController],
  providers: [CollaborationsService],
  exports: [CollaborationsService],
})
export class CollaborationsModule {}
