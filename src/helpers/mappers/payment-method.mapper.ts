import { PaymentMethod } from 'prisma/generated/prisma/client';
import { PaymentMethodResponseDto } from 'src/modules/payment-methods/dto/payment-method-response.dto';

export const paymentMethodToResponseDto = (
  paymentMethod: PaymentMethod,
): PaymentMethodResponseDto => {
  const { id, name, type, brand, color, icon, currency, isActive, userId } =
    paymentMethod;
  return new PaymentMethodResponseDto({
    id,
    name,
    type,
    brand: brand ?? undefined,
    color: color ?? undefined,
    icon: icon ?? undefined,
    currency: currency ?? undefined,
    isActive,
    userId,
  });
};
export const paymentMethodArrayToArrayDto = (
  entityArray: PaymentMethod[],
): PaymentMethodResponseDto[] => {
  return entityArray.map(paymentMethodToResponseDto);
};
