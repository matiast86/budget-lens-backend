import { BadRequestException, Injectable } from '@nestjs/common';
import { TransactionBreakDown } from 'prisma/generated/prisma/browser';
import {
  Currency,
  DebtDirection,
  EntryType,
  PaymentType,
  Status,
} from 'prisma/generated/prisma/enums';
import {
  checkCurrentMonth,
  increaseMonthByInstallment,
  isPastMonth,
  periodMapper,
} from 'src/helpers/dates';
import { transactionToResponseDto } from 'src/helpers/mappers/transaction.mapper';
import { DebtOwnersService } from '../debt-owners/debt-owners.service';
import { DebtsService } from '../debts/debts.service';
import { LedgersService } from '../ledgers/ledgers.service';
import { PaymentMethodsService } from '../payment-methods/payment-methods.service';
import { TransactionsBreakDownService } from '../transactions-break-down/transactions-break-down.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { TransactionsRepository } from './transactions.repository';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly transactionBDService: TransactionsBreakDownService,
    private readonly paymentMethodService: PaymentMethodsService,
    private readonly debtsService: DebtsService,
    private readonly debtOwnersService: DebtOwnersService,
    private readonly ledgersService: LedgersService,
  ) {}

  //helper methods
  async createTransactionsBD(transactionId: number): Promise<void> {
    for (let weekNumber = 1; weekNumber <= 4; weekNumber++) {
      await this.transactionBDService.create({
        weekNumber,
        amount: 0,
        transactionId,
      });
    }
  }

  async handleDebtOwner(
    debtOwnerId: number,
    direction: DebtDirection,
    description: string,
    debtAmount: number,
    transactionDate: Date,
  ): Promise<void> {
    const date = transactionDate ?? new Date();
    const owner = await this.debtOwnersService.findById(debtOwnerId);
    await this.debtsService.create(owner, {
      direction,
      amount: debtAmount,
      periodString: periodMapper(date),
      description,
    });
  }

  sumBreakDownAmount(transactionBreakDowns: TransactionBreakDown[]): number {
    const amounts = transactionBreakDowns.map((bd) => bd.amount);
    return amounts.reduce((acc, cur) => acc + Number(cur), 0);
  }

  updateComment(existing?: string, newComment?: string): string | undefined {
    const merged = [existing, newComment].filter(Boolean).join('/');
    return merged || undefined;
  }

  setTransactionStatus(transactionDate: Date): Status {
    switch (true) {
      case checkCurrentMonth(transactionDate):
        return Status.CURRENT;
        break;
      case isPastMonth(transactionDate):
        return Status.CLOSED;
        break;
      default:
        return Status.FUTURE;
    }
  }

  async handleInstallments(
    installments: number,
    totalProvidedAmount: number,
    currency: Currency,
    ledgerCurrency: Currency,
    transactionDate: Date,
    categoryId: number,
    ledgerId: number,
    paymentMethodId: number,
    groupId: number,
    exchangeRate?: number,
    debtOwnerId?: number,
    debtAmount?: number,
    debtDirection?: DebtDirection,
    comment?: string,
  ): Promise<TransactionResponseDto[]> {
    const newTransactions: TransactionResponseDto[] = [];
    const totalAmount = this.assignTotalAmount(
      totalProvidedAmount,
      currency,
      ledgerCurrency,
      exchangeRate,
    );
    const monthlyAmount = totalAmount / installments;
    if (debtOwnerId && debtDirection && debtAmount) {
      for (let installment = 1; installment <= installments; installment++) {
        const newTransaction = await this.transactionsRepository.create({
          status: this.setTransactionStatus(transactionDate),
          entryType: EntryType.EXPENSE,
          transactionDate,
          paymentMonth: increaseMonthByInstallment(
            transactionDate,
            installment,
          ),
          comment,
          currency,
          exchangeRate,
          totalAmount,
          monthlyAmount,
          category: { connect: { id: categoryId } },
          ledger: { connect: { id: ledgerId } },
          group: { connect: { id: groupId } },
          debtOwner: { connect: { id: debtOwnerId } },
          paymentMethod: { connect: { id: paymentMethodId } },
        });
        await this.createTransactionsBD(newTransaction.id);

        newTransactions.push(transactionToResponseDto(newTransaction));

        await this.handleDebtOwner(
          debtOwnerId,
          debtDirection,
          newTransaction.group.name,
          debtAmount,
          newTransaction.paymentMonth,
        );
      }
      return newTransactions;
    }
    for (let installment = 1; installment <= installments; installment++) {
      const newTransaction = await this.transactionsRepository.create({
        status: this.setTransactionStatus(transactionDate),
        entryType: EntryType.EXPENSE,
        transactionDate,
        paymentMonth: increaseMonthByInstallment(transactionDate, installment),
        comment,
        currency,
        exchangeRate,
        totalAmount,
        monthlyAmount,
        category: { connect: { id: categoryId } },
        ledger: { connect: { id: ledgerId } },
        group: { connect: { id: groupId } },
        paymentMethod: { connect: { id: paymentMethodId } },
      });
      await this.createTransactionsBD(newTransaction.id);
      newTransactions.push(transactionToResponseDto(newTransaction));
    }
    return newTransactions;
  }

  assignTotalAmount(
    totalProvidedAmount: number,
    currency: Currency,
    ledgerCurrency: Currency,
    exchangeRate?: number,
  ): number {
    return currency != ledgerCurrency && exchangeRate
      ? totalProvidedAmount * exchangeRate
      : totalProvidedAmount;
  }

  /////////////////////////////////////////////////////////////////////

  async createExpense(
    ledgerId: number,
    createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto | TransactionResponseDto[]> {
    const {
      categoryId,
      groupId,
      paymentMethodId,
      debtOwnerId,
      debtAmount,
      debtDirection,
      transactionDate,
      paymentMonthValue,
      installments,
      comment,
      currency,
      exchangeRate,
      totalProvidedAmount,
      weekNumber,
    } = createTransactionDto;
    const ledger = await this.ledgersService.findOne(ledgerId);

    if (currency != ledger.currency && !exchangeRate)
      throw new BadRequestException(`You must provide the exchange rate.`);

    if (checkCurrentMonth(transactionDate)) {
      const method = await this.paymentMethodService.findById(paymentMethodId);
      const existing = await this.transactionsRepository.findByGroupAndCategory(
        categoryId,
        paymentMethodId,
        groupId,
        currency,
        EntryType.EXPENSE,
      );
      if (existing && method.type != PaymentType.CREDIT_CARD) {
        const breakDowns = existing.transactionsBreakDown;
        const bd = breakDowns.find((tbd) => tbd.weekNumber === weekNumber);
        const bdAmount = bd ? Number(bd.amount) : 0;
        const updatedAmount =
          bdAmount +
          this.assignTotalAmount(
            totalProvidedAmount,
            currency,
            ledger.currency,
            exchangeRate,
          );
        if (bd)
          await this.transactionBDService.update(bd.id, {
            amount: updatedAmount,
          });

        const updatedTotal = this.sumBreakDownAmount(
          existing.transactionsBreakDown,
        );

        const updatedCommnent = this.updateComment(
          existing.comment ?? undefined,
          comment,
        );
        await this.transactionsRepository.update(existing.id, {
          comment: updatedCommnent,
          totalAmount: updatedTotal,
        });
        const debtDescription = existing.groupId
          ? existing.group?.name
          : undefined;

        if (debtOwnerId && debtDirection && debtDescription && debtAmount)
          await this.handleDebtOwner(
            debtOwnerId,
            debtDirection,
            debtDescription,
            debtAmount,
            transactionDate,
          );
      }
    }
    if (installments)
      await this.handleInstallments(
        installments,
        totalProvidedAmount,
        currency,
        ledger.currency,
        transactionDate,
        categoryId,
        ledgerId,
        paymentMethodId,
        groupId,
        exchangeRate,
        debtOwnerId,
        debtAmount,
        debtDirection,
        comment,
      );
  }
}
