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

export const parseDate = (date: string): Date => {
  const parsed = dayjs.utc(date, 'YYYY-MM-DD', true);
  if (!parsed.isValid()) {
    throw new BadRequestException('Invalid date format. Expected: YYYY-MM-DD');
  }
  return parsed.toDate();
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

export const getWeekofMonth = (date: Date): number => {
  const day = dayjs.utc(date).date();
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  return 4;
};
