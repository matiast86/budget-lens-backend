import { Module } from '@nestjs/common';
import { LedgersModule } from '../ledgers/ledgers.module';
import { UsersModule } from '../users/users.module';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { GroupsRepository } from './groups.repositories';

@Module({
  imports: [UsersModule, LedgersModule],
  controllers: [GroupsController],
  providers: [GroupsService, GroupsRepository],
  exports: [GroupsService],
})
export class GroupsModule {}
