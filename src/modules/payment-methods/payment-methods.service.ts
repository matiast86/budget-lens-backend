import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentMethod, PaymentType } from 'prisma/generated/prisma/client';

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
    await this.usersService.findOne(userId);
    const methods = await this.paymentMethodsRepository.findAllByUser(userId);
    return paymentMethodArrayToArrayDto(methods);
  }

  async findOne(userId: string, id: number): Promise<PaymentMethodResponseDto> {
    await this.usersService.findOne(userId);
    const paymentMethod = await this.paymentMethodsRepository.findById(
      id,
      userId,
    );
    if (!paymentMethod)
      throw new NotFoundException(`Payment method with id: ${id} not found`);
    return paymentMethodToResponseDto(paymentMethod);
  }

  async findByName(
    userId: string,
    name: string,
  ): Promise<PaymentMethodResponseDto> {
    await this.usersService.findOne(userId);
    const method = await this.paymentMethodsRepository.findByName(userId, name);
    if (!method)
      throw new NotFoundException(
        `Payment method with name: ${name} not found`,
      );
    return paymentMethodToResponseDto(method);
  }

  async findByType(
    userId: string,
    type: PaymentType,
  ): Promise<PaymentMethodResponseDto[]> {
    await this.usersService.findOne(userId);
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
    await this.usersService.findOne(userId);
    const updatedPM = await this.paymentMethodsRepository.update(
      id,
      userId,
      updatePaymentMethodDto,
    );

    return paymentMethodToResponseDto(updatedPM);
  }

  async remove(userId: string, id: number): Promise<void> {
    await this.usersService.findOne(userId);
    await this.paymentMethodsRepository.delete(id, userId);
  }

  async findById(id: number): Promise<PaymentMethod> {
    const method = await this.paymentMethodsRepository.findOne(id);
    if (!method)
      throw new NotFoundException(`Payment method with id: ${id} not found.`);
    return method;
  }
}
