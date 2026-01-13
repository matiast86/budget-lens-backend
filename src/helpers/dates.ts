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

export const checkCurrentMonth = (date: Date): boolean => {
  const today = dayjs();
  const parsedDate = dayjs(date);
  return (
    parsedDate.month() === today.month() && parsedDate.year() === today.year()
  );
};

export const isFutureMonth = (date: Date): boolean => {
  const today = dayjs();
  const parsedDate = dayjs(date);
  return (
    parsedDate.year() > today.year() ||
    (parsedDate.month() > today.month() && parsedDate.year() === today.year())
  );
};

export const isPastMonth = (date: Date): boolean => {
  const today = dayjs();
  const parsedDate = dayjs(date);
  return (
    parsedDate.year() < today.year() ||
    (parsedDate.month() < today.month() && parsedDate.year() === today.year())
  );
};

export const increaseMonthByInstallment = (
  date: Date,
  installment: number,
): Date => {
  const formatedDate = dayjs(date).startOf('month');
  return formatedDate.add(installment - 1, 'month').toDate();
};
