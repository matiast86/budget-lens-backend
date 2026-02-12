import { Module } from '@nestjs/common';
import { LedgersModule } from '../ledgers/ledgers.module';
import { UsersModule } from '../users/users.module';
import { CollaborationsController } from './collaborations.controller';
import { CollaborationsRepository } from './collaborations.repository';
import { CollaborationsService } from './collaborations.service';

@Module({
  imports: [UsersModule, LedgersModule],
  controllers: [CollaborationsController],
  providers: [CollaborationsService, CollaborationsRepository],
  exports: [CollaborationsService],
})
export class CollaborationsModule {}
