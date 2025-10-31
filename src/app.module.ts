import { Module } from '@nestjs/common';
import { SharedModule } from './modules/shared/shared.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, SharedModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
