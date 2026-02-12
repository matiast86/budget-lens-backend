import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PaymentType } from 'prisma/generated/prisma/client';
import { GetUser } from 'src/decorators/get-user/get-user.decorator';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { PaymentMethodResponseDto } from './dto/payment-method-response.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethodsService } from './payment-methods.service';

@ApiBearerAuth()
@ApiTags('Payment Methods')
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiOperation({ summary: 'Create a new payment method' })
  @ApiCreatedResponse({ type: PaymentMethodResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid payload' })
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
  @ApiOperation({
    summary: 'List all payment methods for the authenticated user',
  })
  @ApiOkResponse({ type: PaymentMethodResponseDto, isArray: true })
  @ApiNotFoundResponse({ description: 'User not found' })
  async findAll(
    @GetUser('id') userId: string,
  ): Promise<PaymentMethodResponseDto[]> {
    return await this.paymentMethodsService.findAllByUser(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @ApiOperation({ summary: 'Get a payment method by id' })
  @ApiParam({ name: 'id', type: Number, description: 'Payment method id' })
  @ApiOkResponse({ type: PaymentMethodResponseDto })
  @ApiNotFoundResponse({ description: 'Payment method or user not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: string,
  ): Promise<PaymentMethodResponseDto> {
    return await this.paymentMethodsService.findOne(userId, id);
  }

  @HttpCode(HttpStatus.OK)
  @Get('name/:name')
  @ApiOperation({
    summary: 'Get a payment method by name for the authenticated user',
  })
  @ApiParam({ name: 'name', type: String, description: 'Payment method name' })
  @ApiOkResponse({ type: PaymentMethodResponseDto })
  @ApiNotFoundResponse({ description: 'Payment method or user not found' })
  async findByName(
    @GetUser('id') userId: string,
    @Param('name') name: string,
  ): Promise<PaymentMethodResponseDto> {
    return await this.paymentMethodsService.findByName(userId, name);
  }

  @HttpCode(HttpStatus.OK)
  @Get('type/:type')
  @ApiOperation({
    summary: 'List payment methods by type for the authenticated user',
  })
  @ApiParam({
    name: 'type',
    enum: PaymentType,
    description: 'Payment method type',
  })
  @ApiOkResponse({ type: PaymentMethodResponseDto, isArray: true })
  @ApiNotFoundResponse({ description: 'User not found' })
  async findByType(
    @GetUser('id') userId: string,
    @Param('type', new ParseEnumPipe(PaymentType)) type: PaymentType,
  ): Promise<PaymentMethodResponseDto[]> {
    return await this.paymentMethodsService.findByType(userId, type);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a payment method' })
  @ApiParam({ name: 'id', type: Number, description: 'Payment method id' })
  @ApiOkResponse({ type: PaymentMethodResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid payload' })
  @ApiNotFoundResponse({ description: 'Payment method or user not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: string,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethodResponseDto> {
    return await this.paymentMethodsService.update(
      userId,
      id,
      updatePaymentMethodDto,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a payment method' })
  @ApiParam({ name: 'id', type: Number, description: 'Payment method id' })
  @ApiNoContentResponse({ description: 'Payment method deleted' })
  @ApiNotFoundResponse({ description: 'Payment method or user not found' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: string,
  ): Promise<void> {
    return await this.paymentMethodsService.remove(userId, id);
  }
}
