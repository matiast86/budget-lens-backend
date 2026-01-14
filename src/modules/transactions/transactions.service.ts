import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { AssignBreakDownDto } from '../transactions-break-down/dto/assign-break-down.dto';
import { TransactionsBreakDownService } from '../transactions-break-down/transactions-break-down.service';
import { CreateIncomeDto } from './dto/create-income.dto';
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

  // Helper: create 4 weekly breakdown rows for a new transaction.
  async createTransactionsBD(transactionId: number): Promise<void> {
    for (let weekNumber = 1; weekNumber <= 4; weekNumber++) {
      await this.transactionBDService.create({
        weekNumber,
        amount: 0,
        transactionId,
      });
    }
  }

  // Helper: record a debt entry tied to the transaction context.
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

  // Helper: merge existing and new comments into a single string.
  private updateComment(
    existing?: string,
    newComment?: string,
  ): string | undefined {
    const merged = [existing, newComment].filter(Boolean).join('/');
    return merged || undefined;
  }

  // Helper: determine transaction status based on its date.
  private setTransactionStatus(transactionDate: Date): Status {
    switch (true) {
      case checkCurrentMonth(transactionDate):
        return Status.CURRENT;
      case isPastMonth(transactionDate):
        return Status.CLOSED;
      default:
        return Status.FUTURE;
    }
  }

  // Helper: create installment transactions and optional debt records.
  private async handleInstallments(
    installments: number,
    totalProvidedAmount: number,
    currency: Currency,
    ledgerCurrency: Currency,
    transactionDate: Date,
    paymentMonth: Date,
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
    // If debt is provided, create a debt entry per installment.
    if (debtOwnerId && debtDirection && debtAmount != undefined) {
      for (let installment = 1; installment <= installments; installment++) {
        const newTransaction = await this.transactionsRepository.create({
          status: this.setTransactionStatus(transactionDate),
          entryType: EntryType.EXPENSE,
          transactionDate,
          paymentMonth: increaseMonthByInstallment(paymentMonth, installment),
          comment,
          currency,
          exchangeRate,
          totalAmount,
          monthlyAmount,
          category: { connect: { id: categoryId } },
          ledger: { connect: { id: ledgerId } },
          debtOwner: { connect: { id: debtOwnerId } },
          group: { connect: { id: groupId } },
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
    // No debt: just create the installment transactions.
    for (let installment = 1; installment <= installments; installment++) {
      const newTransaction = await this.transactionsRepository.create({
        status: this.setTransactionStatus(transactionDate),
        entryType: EntryType.EXPENSE,
        transactionDate,
        paymentMonth: increaseMonthByInstallment(paymentMonth, installment),
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

  private assignTotalAmount(
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

  // Create an expense transaction, with merge-on-current-month behavior.
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

    // Enforce exchange rate when currencies differ.
    if (currency != ledger.currency && !exchangeRate)
      throw new BadRequestException(`You must provide the exchange rate.`);

    // Current month + non-credit-card: merge into existing transaction.
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
        if (bd) {
          await this.transactionBDService.update(bd.id, {
            amount: updatedAmount,
          });
        }
        // Update total by the delta to avoid stale in-memory breakdown values.
        const delta = updatedAmount - bdAmount;
        const updatedTotal = Number(existing.totalAmount) + delta;

        const updatedCommnent = this.updateComment(
          existing.comment ?? undefined,
          comment,
        );
        const updated = await this.transactionsRepository.update(existing.id, {
          comment: updatedCommnent,
          totalAmount: updatedTotal,
        });
        const debtDescription = existing.groupId
          ? existing.group.name
          : undefined;

        if (
          debtOwnerId &&
          debtDirection &&
          debtDescription &&
          debtAmount != undefined
        )
          await this.handleDebtOwner(
            debtOwnerId,
            debtDirection,
            debtDescription,
            debtAmount,
            transactionDate,
          );
        return transactionToResponseDto(updated);
      }
    }
    // Default payment month to transaction date when not provided.
    const paymentMonth = paymentMonthValue ?? transactionDate;
    // If installments are provided, delegate to the installment flow.
    if (installments)
      return await this.handleInstallments(
        installments,
        totalProvidedAmount,
        currency,
        ledger.currency,
        transactionDate,
        paymentMonth,
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

    const totalAmount = this.assignTotalAmount(
      totalProvidedAmount,
      currency,
      ledger.currency,
      exchangeRate,
    );

    // Single transaction with debt.
    if (debtOwnerId && debtDirection && debtAmount != undefined) {
      const newTransaction = await this.transactionsRepository.create({
        status: this.setTransactionStatus(transactionDate),
        entryType: EntryType.EXPENSE,
        transactionDate,
        paymentMonth,
        comment,
        currency,
        exchangeRate,
        totalAmount,
        monthlyAmount: totalAmount,
        category: { connect: { id: categoryId } },
        ledger: { connect: { id: ledgerId } },
        debtOwner: { connect: { id: debtOwnerId } },
        group: { connect: { id: groupId } },
        paymentMethod: { connect: { id: paymentMethodId } },
      });
      await this.createTransactionsBD(newTransaction.id);
      await this.handleDebtOwner(
        debtOwnerId,
        debtDirection,
        newTransaction.group.name,
        debtAmount,
        newTransaction.paymentMonth,
      );
      return transactionToResponseDto(newTransaction);
    }
    // Single transaction without debt.
    const newTransaction = await this.transactionsRepository.create({
      status: this.setTransactionStatus(transactionDate),
      entryType: EntryType.EXPENSE,
      transactionDate,
      paymentMonth,
      comment,
      currency,
      exchangeRate,
      totalAmount,
      monthlyAmount: totalAmount,
      category: { connect: { id: categoryId } },
      ledger: { connect: { id: ledgerId } },
      group: { connect: { id: groupId } },
      paymentMethod: { connect: { id: paymentMethodId } },
    });
    await this.createTransactionsBD(newTransaction.id);
    return transactionToResponseDto(newTransaction);
  }

  async createIncome(
    ledgerId: number,
    createIncomeDto: CreateIncomeDto,
  ): Promise<TransactionResponseDto> {
    const {
      categoryId,
      groupId,
      paymentMethodId,
      transactionDate,
      paymentMonthValue,
      comment,
      currency,
      exchangeRate,
      totalProvidedAmount,
    } = createIncomeDto;
    const ledger = await this.ledgersService.findOne(ledgerId);

    // Enforce exchange rate when currencies differ.
    if (currency != ledger.currency && !exchangeRate)
      throw new BadRequestException(`You must provide the exchange rate.`);

    // Default payment month to transaction date when not provided.
    const paymentMonth = paymentMonthValue ?? transactionDate;

    const totalAmount = this.assignTotalAmount(
      totalProvidedAmount,
      currency,
      ledger.currency,
      exchangeRate,
    );

    const newTransaction = await this.transactionsRepository.create({
      status: this.setTransactionStatus(transactionDate),
      entryType: EntryType.INCOME,
      transactionDate,
      paymentMonth,
      comment,
      currency,
      exchangeRate,
      totalAmount,
      monthlyAmount: totalAmount,
      category: { connect: { id: categoryId } },
      ledger: { connect: { id: ledgerId } },
      group: { connect: { id: groupId } },
      paymentMethod: { connect: { id: paymentMethodId } },
    });

    await this.createTransactionsBD(newTransaction.id);
    return transactionToResponseDto(newTransaction);
  }

  async assignBreakDown(
    transactionId: number,
    assignBreakDownDto: AssignBreakDownDto,
  ): Promise<TransactionResponseDto> {
    const { amountOne, amountTwo, amountThree, amountFour } =
      assignBreakDownDto;

    const transaction =
      await this.transactionsRepository.findById(transactionId);
    if (!transaction)
      throw new NotFoundException(
        `Transaction with id: ${transactionId} not found.`,
      );

    const breakDowns = transaction.transactionsBreakDown;
    const amountByWeek: Record<number, number | undefined> = {
      1: amountOne,
      2: amountTwo,
      3: amountThree,
      4: amountFour,
    };
    let totalAmount = 0;

    for (const bd of breakDowns) {
      const newAmount = amountByWeek[bd.weekNumber];
      if (newAmount != null) {
        await this.transactionBDService.update(bd.id, { amount: newAmount });
      }
      const amountToUse = newAmount != null ? newAmount : Number(bd.amount);
      totalAmount += amountToUse;
    }
    const updated = await this.transactionsRepository.update(transaction.id, {
      totalAmount,
    });

    return transactionToResponseDto(updated);
  }
}
