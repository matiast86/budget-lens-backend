import { Module } from '@nestjs/common';
import { CategoryTemplatesModule } from '../category-templates/category-templates.module';
import { InflationIndexesModule } from '../inflation-indexes/inflation-indexes.module';
import { PaymentMethodsModule } from '../payment-methods/payment-methods.module';
import { LedgersController } from './ledgers.controller';
import { LedgersRepository } from './ledgers.repository';
import { LedgersService } from './ledgers.service';

@Module({
  imports: [
    CategoryTemplatesModule,
    InflationIndexesModule,
    PaymentMethodsModule,
  ],
  controllers: [LedgersController],
  providers: [LedgersService, LedgersRepository],
  exports: [LedgersService],
})
export class LedgersModule {}
