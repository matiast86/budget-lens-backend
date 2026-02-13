import { InflationIndex } from 'prisma/generated/prisma/client';
import { InflationIndexResponseDto } from 'src/modules/inflation-indexes/dto/inflation-index-response.dto';

export const inflationIndexToResponseDto = (
  inflationIndex: InflationIndex,
): InflationIndexResponseDto => {
  const { id, currency, period, monthlyRate, cpiIndex, createdAt, updatedAt } =
    inflationIndex;
  return new InflationIndexResponseDto({
    id,
    currency,
    period: period.toISOString(),
    monthlyRate: Number(monthlyRate),
    cpiIndex: Number(cpiIndex),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  });
};

export const inflationIndexArrayToArrayDto = (
  entityArray: InflationIndex[],
): InflationIndexResponseDto[] => {
  return entityArray ? entityArray.map(inflationIndexToResponseDto) : [];
};
