import { PaymentMethodResponseDto } from 'src/modules/payment-methods/dto/payment-method-response.dto';
import { PaymentMethodMinimal } from 'src/types/entities/entities-with-relations';

export const paymentMethodToResponseDto = (
  paymentMethod: PaymentMethodMinimal,
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
  entityArray: PaymentMethodMinimal[],
): PaymentMethodResponseDto[] => {
  return entityArray ? entityArray.map(paymentMethodToResponseDto) : [];
};
