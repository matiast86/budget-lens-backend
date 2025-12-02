import { Injectable } from '@nestjs/common';
import { PaymentType } from '@prisma/client';

import {
  paymentMethodArrayToArrayDto,
  paymentMethodToResponseDto,
} from 'src/helpers/mappers/payment-method.mapper';
import { UsersService } from '../users/users.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { PaymentMethodResponseDto } from './dto/payment-method-response.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethodsRepository } from './payment-methods.repository';

@Injectable()
export class PaymentMethodsService {
  constructor(
    private readonly paymentMethodsRepository: PaymentMethodsRepository,
    private readonly usersService: UsersService,
  ) {}

  async create(
    userId: string,
    createPaymentMethodDto: CreatePaymentMethodDto,
  ): Promise<PaymentMethodResponseDto> {
    const { name, type, brand, color, icon, currency } = createPaymentMethodDto;
    await this.usersService.findOne(userId);
    const newPM = await this.paymentMethodsRepository.create({
      name,
      type,
      brand,
      color,
      icon,
      currency,
      user: { connect: { id: userId } },
    });

    return paymentMethodToResponseDto(newPM);
  }

  async findAllByUser(userId: string): Promise<PaymentMethodResponseDto[]> {
    const methods = await this.paymentMethodsRepository.findAllByUser(userId);
    return paymentMethodArrayToArrayDto(methods);
  }

  async findOne(userId: string, id: number): Promise<PaymentMethodResponseDto> {
    await this.usersService.findOne(userId);
    const paymentMethod = await this.paymentMethodsRepository.findById(
      id,
      userId,
    );
    return paymentMethodToResponseDto(paymentMethod);
  }

  async findByName(
    userId: string,
    name: string,
  ): Promise<PaymentMethodResponseDto> {
    const method = await this.paymentMethodsRepository.findByName(userId, name);
    return paymentMethodToResponseDto(method);
  }

  async findByType(
    userId: string,
    type: PaymentType,
  ): Promise<PaymentMethodResponseDto[]> {
    const methods = await this.paymentMethodsRepository.findByType(
      userId,
      type,
    );
    return paymentMethodArrayToArrayDto(methods);
  }

  async update(
    userId: string,
    id: number,
    updatePaymentMethodDto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethodResponseDto> {
    const updatedPM = await this.paymentMethodsRepository.update(
      id,
      userId,
      updatePaymentMethodDto,
    );

    return paymentMethodToResponseDto(updatedPM);
  }

  async remove(userId: string, id: number): Promise<void> {
    await this.paymentMethodsRepository.delete(id, userId);
  }
}
