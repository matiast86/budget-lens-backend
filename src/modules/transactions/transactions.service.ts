import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Transaction } from 'prisma/generated/prisma/client';
import {
  Currency,
  EntryType,
  PaymentType,
  Status,
} from 'prisma/generated/prisma/enums';
import {
  checkCurrentMonth,
  increaseMonthByInstallment,
  isPastMonth,
  parsePeriod,
} from 'src/helpers/dates';
import {
  transactionArrayToArrayDto,
  transactionToResponseDto,
} from 'src/helpers/mappers/transaction.mapper';
import { TransactionRelation } from 'src/types/entities/transaction.types';
import { InflationIndexesService } from '../inflation-indexes/inflation-indexes.service';
import { LedgersService } from '../ledgers/ledgers.service';
import { PaymentMethodsService } from '../payment-methods/payment-methods.service';
import { AssignBreakDownDto } from '../transactions-break-down/dto/assign-break-down.dto';
import { TransactionsBreakDownService } from '../transactions-break-down/transactions-break-down.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { DebtAssignmentDto } from './dto/debt-assignment.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { TransactionsRepository } from './transactions.repository';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly transactionBDService: TransactionsBreakDownService,
    private readonly paymentMethodService: PaymentMethodsService,
    private readonly ledgersService: LedgersService,
    private readonly inflationIndexesService: InflationIndexesService,
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
  async handleDebtOwners(
    transactionId: number,
    transactionDate: Date,
    debtAssignmentsDto: DebtAssignmentDto[],
    description?: string,
  ): Promise<void> {
    for (const assigment of debtAssignmentsDto) {
      const { debtOwnerId, direction, amount } = assigment;
      await this.transactionsRepository.createTransactionDebtOwner(
        transactionId,
        debtOwnerId,
        amount,
        direction,
        transactionDate,
        description,
      );
    }
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
    ledgerBaseIndex: number,
    transactionDate: Date,
    paymentMonth: Date,
    categoryId: number,
    ledgerId: number,
    paymentMethodId: number,
    groupId: number,
    debtAssigmentsDto: DebtAssignmentDto[],
    impactsCashflow?: boolean,
    exchangeRate?: number,
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
    if (debtAssigmentsDto.length != 0) {
      for (let installment = 1; installment <= installments; installment++) {
        const installmentPaymentMonth = increaseMonthByInstallment(
          paymentMonth,
          installment,
        );
        const inflation = await this.getInflationData(
          ledgerCurrency,
          installmentPaymentMonth,
          monthlyAmount,
          ledgerBaseIndex,
        );
        const newTransaction = await this.transactionsRepository.create({
          status: this.setTransactionStatus(transactionDate),
          entryType: EntryType.EXPENSE,
          transactionDate,
          paymentMonth: installmentPaymentMonth,
          comment,
          currency,
          exchangeRate,
          totalAmount,
          monthlyAmount,
          impactsCashflow,
          ...inflation,
          category: { connect: { id: categoryId } },
          ledger: { connect: { id: ledgerId } },
          group: { connect: { id: groupId } },
          paymentMethod: { connect: { id: paymentMethodId } },
        });
        await this.createTransactionsBD(newTransaction.id);

        await this.handleDebtOwners(
          newTransaction.id,
          paymentMonth,
          debtAssigmentsDto,
          newTransaction.group.name,
        );
        const refreshed = await this.transactionsRepository.findById(
          newTransaction.id,
        );
        if (!refreshed) throw new NotFoundException(`Transaction not found.`);
        newTransactions.push(transactionToResponseDto(refreshed));
      }
      return newTransactions;
    }
    // No debt: just create the installment transactions.
    for (let installment = 1; installment <= installments; installment++) {
      const installmentPaymentMonth = increaseMonthByInstallment(
        paymentMonth,
        installment,
      );
      const inflation = await this.getInflationData(
        ledgerCurrency,
        installmentPaymentMonth,
        monthlyAmount,
        ledgerBaseIndex,
      );
      const newTransaction = await this.transactionsRepository.create({
        status: this.setTransactionStatus(transactionDate),
        entryType: EntryType.EXPENSE,
        transactionDate,
        paymentMonth: installmentPaymentMonth,
        comment,
        currency,
        exchangeRate,
        totalAmount,
        monthlyAmount,
        impactsCashflow,
        ...inflation,
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

  // Helper: fetch CPI and calculate inflation-adjusted amount.
  // Returns empty object when no CPI data exists for the period.
  private async getInflationData(
    currency: Currency,
    paymentMonth: Date,
    monthlyAmount: number,
    baseCpiIndex: number,
  ): Promise<{ cpiIndex?: number; realMonthlyAmount?: number }> {
    const cpiIndex = await this.inflationIndexesService.getCpiIndex(
      currency,
      paymentMonth,
    );
    if (!cpiIndex) return {};
    return {
      cpiIndex,
      realMonthlyAmount: (monthlyAmount / cpiIndex) * baseCpiIndex,
    };
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
      transactionDate,
      paymentMonthValue,
      installments,
      comment,
      currency,
      exchangeRate,
      totalProvidedAmount,
      weekNumber,
      impactsCashflow,
      debtAssignments,
    } = createTransactionDto;
    const ledger = await this.ledgersService.findOne(ledgerId);

    // Enforce exchange rate when currencies differ.
    if (currency != ledger.currency && !exchangeRate)
      throw new BadRequestException(`You must provide the exchange rate.`);

    // Current month + non-credit-card: merge into existing transaction.
    if (checkCurrentMonth(parsePeriod(transactionDate))) {
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
        const inflation = await this.getInflationData(
          ledger.currency,
          existing.paymentMonth,
          updatedTotal,
          ledger.baseCpiIndex,
        );
        const updated = await this.transactionsRepository.update(existing.id, {
          comment: updatedCommnent,
          totalAmount: updatedTotal,
          ...inflation,
        });
        const debtDescription = existing.groupId
          ? existing.group.name
          : undefined;

        if (debtAssignments.length != 0) {
          await this.handleDebtOwners(
            updated.id,
            updated.paymentMonth,
            debtAssignments,
            debtDescription,
          );
          const refreshed = await this.transactionsRepository.findById(
            updated.id,
          );
          if (!refreshed) throw new NotFoundException(`Transaction not found.`);
          return transactionToResponseDto(refreshed);
        }
        return transactionToResponseDto(updated);
      }
    }
    // Default payment month to transaction date when not provided.
    const paymentMonth = paymentMonthValue
      ? parsePeriod(paymentMonthValue)
      : parsePeriod(transactionDate);
    // If installments are provided, delegate to the installment flow.
    if (installments)
      return await this.handleInstallments(
        installments,
        totalProvidedAmount,
        currency,
        ledger.currency,
        ledger.baseCpiIndex,
        parsePeriod(transactionDate),
        paymentMonth,
        categoryId,
        ledgerId,
        paymentMethodId,
        groupId,
        debtAssignments,
        impactsCashflow,
        exchangeRate,
        comment,
      );

    const totalAmount = this.assignTotalAmount(
      totalProvidedAmount,
      currency,
      ledger.currency,
      exchangeRate,
    );
    const inflation = await this.getInflationData(
      ledger.currency,
      paymentMonth,
      totalAmount,
      ledger.baseCpiIndex,
    );

    // Single transaction with debt.
    if (debtAssignments.length != 0) {
      const newTransaction = await this.transactionsRepository.create({
        status: this.setTransactionStatus(parsePeriod(transactionDate)),
        entryType: EntryType.EXPENSE,
        transactionDate,
        paymentMonth,
        comment,
        currency,
        exchangeRate,
        totalAmount,
        monthlyAmount: totalAmount,
        impactsCashflow,
        ...inflation,
        category: { connect: { id: categoryId } },
        ledger: { connect: { id: ledgerId } },
        group: { connect: { id: groupId } },
        paymentMethod: { connect: { id: paymentMethodId } },
      });
      await this.createTransactionsBD(newTransaction.id);

      await this.handleDebtOwners(
        newTransaction.id,
        newTransaction.paymentMonth,
        debtAssignments,
        newTransaction.group.name,
      );
      const refreshed = await this.transactionsRepository.findById(
        newTransaction.id,
      );
      if (!refreshed) throw new NotFoundException(`Transaction not found.`);

      return transactionToResponseDto(refreshed);
    }
    // Single transaction without debt.
    const newTransaction = await this.transactionsRepository.create({
      status: this.setTransactionStatus(parsePeriod(transactionDate)),
      entryType: EntryType.EXPENSE,
      transactionDate,
      paymentMonth,
      comment,
      currency,
      exchangeRate,
      totalAmount,
      monthlyAmount: totalAmount,
      impactsCashflow,
      ...inflation,
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
      impactsCashflow,
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
    const inflation = await this.getInflationData(
      ledger.currency,
      paymentMonth,
      totalAmount,
      ledger.baseCpiIndex,
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
      impactsCashflow,
      ...inflation,
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

  async findAllByLedgerId(
    ledgerId: number,
    skip: number = 1,
    take: number = 20,
  ): Promise<TransactionResponseDto[]> {
    const ledgers = await this.transactionsRepository.findAllByPaginated(
      { ledgerId },
      skip,
      take,
    );

    return transactionArrayToArrayDto(ledgers);
  }

  async findById(id: number): Promise<TransactionResponseDto> {
    const transaction = await this.transactionsRepository.findById(id);
    if (!transaction)
      throw new NotFoundException(`Transaction with id: ${id} not found.`);
    return transactionToResponseDto(transaction);
  }

  async findEntityById(id: number): Promise<Transaction | null> {
    return await this.transactionsRepository.findById(id);
  }

  async changeRelation(
    id: number,
    relation: TransactionRelation,
    targetId: number,
  ): Promise<TransactionResponseDto> {
    const data: Prisma.TransactionUpdateInput = {
      [relation]: { connect: { id: targetId } },
    };
    const updated = await this.transactionsRepository.update(id, data);
    return transactionToResponseDto(updated);
  }
}
