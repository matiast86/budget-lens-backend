import { BadRequestException } from '@nestjs/common';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const parsePeriod = (period: string): Date => {
  const parsed = dayjs.utc(period + '-01', 'YYYY-MM-DD', true);
  if (!parsed.isValid()) {
    throw new BadRequestException('Invalid period format. Expected: YYYY-MM');
  }

  return parsed.startOf('month').toDate();
};

export const periodMapper = (period: Date) => {
  return dayjs.utc(period).format('YYYY-MM');
};
