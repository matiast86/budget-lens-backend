import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PaymentType } from '@prisma/client';
import { GetUser } from 'src/decorators/get-user/get-user.decorator';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { PaymentMethodResponseDto } from './dto/payment-method-response.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethodsService } from './payment-methods.service';

@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() createPaymentMethodDto: CreatePaymentMethodDto,
    @GetUser('id') userId: string,
  ): Promise<PaymentMethodResponseDto> {
    const { name, type, brand, color, icon, currency } = createPaymentMethodDto;
    return await this.paymentMethodsService.create(userId, {
      name,
      type,
      brand,
      color,
      icon,
      currency,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(@GetUser('id') userId: string) {
    return await this.paymentMethodsService.findAllByUser(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return await this.paymentMethodsService.findOne(userId, +id);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/get-by-name/:name')
  async findByName(
    @GetUser('id') userId: string,
    @Param('name') name: string,
  ): Promise<PaymentMethodResponseDto> {
    return await this.paymentMethodsService.findByName(userId, name);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/get-by-type/:type')
  async findByType(
    @GetUser('id') userId: string,
    @Param('type') type: PaymentType,
  ): Promise<PaymentMethodResponseDto[]> {
    return await this.paymentMethodsService.findByType(userId, type);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
  ) {
    return await this.paymentMethodsService.update(
      userId,
      +id,
      updatePaymentMethodDto,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return await this.paymentMethodsService.remove(userId, +id);
  }
}
