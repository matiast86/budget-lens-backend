import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { PaymentMethodsController } from './payment-methods.controller';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethodsRepository } from './payment-methods.repository';

@Module({
  imports: [UsersModule],
  controllers: [PaymentMethodsController],
  providers: [PaymentMethodsService, PaymentMethodsRepository],
})
export class PaymentMethodsModule {}
