import { CreditCardResponseDto } from 'src/modules/credit-cards/dto/credit-card-response.dto';
import { CreditCardEntity } from 'src/modules/credit-cards/entities/credit-card.entity';
import { CreditCardMinimal } from 'src/types/entities/entities-with-relations';

export const creditCardToEntity = (
  creditCard: CreditCardMinimal,
): CreditCardEntity => {
  const { id, name, type, userId } = creditCard;
  return new CreditCardEntity({ id, name, type, userId });
};

export const creditCardEntityToResponseDto = (
  creditCard: CreditCardEntity,
): CreditCardResponseDto => {
  const { id, name, type, userId } = creditCard;
  return new CreditCardResponseDto({ id, name, type, userId });
};

export const creditCardArrayToArrayDto = (
  entityArray: CreditCardEntity[],
): CreditCardResponseDto[] => {
  return entityArray.map(creditCardEntityToResponseDto);
};
