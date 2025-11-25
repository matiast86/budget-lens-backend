import { PaymentMethodResponseDto } from 'src/modules/payment-methods/dto/payment-method-response.dto';
import { PaymentMethodEntity } from 'src/modules/payment-methods/entities/payment-method.entity';
import { PaymentMethodMinimal } from 'src/types/entities/entities-with-relations';
import {
  transactionArrayToArrayDto,
  transactionToEntity,
} from './transaction.mapper';

export const paymentMethodToEntity = (
  paymentMethod: PaymentMethodMinimal,
): PaymentMethodEntity => {
  const {
    id,
    name,
    type,
    brand,
    color,
    icon,
    currency,
    isActive,
    userId,
    transactions,
  } = paymentMethod;

  return new PaymentMethodEntity({
    id,
    name,
    type,
    brand: brand ? brand : undefined,
    color: color ? color : undefined,
    icon: icon ? icon : undefined,
    currency: currency ? currency : undefined,
    isActive,
    userId,
    transactions: transactions?.map(transactionToEntity) ?? [],
  });
};
export const paymentMethodEntityToResponseDto = (
  paymentMethod: PaymentMethodEntity,
): PaymentMethodResponseDto => {
  const {
    id,
    name,
    type,
    brand,
    color,
    icon,
    currency,
    isActive,
    userId,
    transactions,
  } = paymentMethod;
  return new PaymentMethodResponseDto({
    id,
    name,
    type,
    brand,
    color,
    icon,
    currency,
    isActive,
    userId,
    transactions: transactionArrayToArrayDto(transactions),
  });
};
export const paymentMethodArrayToArrayDto = (
  entityArray: PaymentMethodEntity[],
): PaymentMethodResponseDto[] => {
  return entityArray.map(paymentMethodEntityToResponseDto);
};
