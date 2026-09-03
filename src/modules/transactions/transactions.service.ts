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
  TransactionType,
} from 'prisma/generated/prisma/enums';
import {
  checkCurrentMonth,
  increaseMonthByInstallment,
  isPastMonth,
  monthRange,
  parseDate,
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
import { TransactionBreakDownResponseDto } from '../transactions-break-down/dto/transaction-break-down-response.dto';
import { TransactionsBreakDownService } from '../transactions-break-down/transactions-break-down.service';
import { FixedBundleDto } from './dto/bundle-dtos/fixed-bundle.dto';
import { CreateIncomeDto } from './dto/create-income.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { DebtAssignmentDto } from './dto/debt-assignment.dto';
import { FilterTransactionsDto } from './dto/filter-transactions.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { UpdateTransactionCoreDto } from './dto/update-transaction-core.dto';
import { UpdateTransactionFlagsDto } from './dto/update-transaction-flags.dto';
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
  async createTransactionsBD(
    transactionId: number,
    client: Prisma.TransactionClient,
  ): Promise<TransactionBreakDownResponseDto[]> {
    return await this.transactionBDService.createBundle(transactionId, client);
  }

  // Helper: record a debt entry tied to the transaction context.
  async handleDebtOwners(
    transactionId: number,
    transactionDate: Date,
    debtAssignmentsDto: DebtAssignmentDto[],
    description: string,
    client: Prisma.TransactionClient,
  ): Promise<void> {
    for (const debtAssignment of debtAssignmentsDto) {
      await this.transactionsRepository.createTransactionDebtOwner(
        transactionId,
        debtAssignment.debtOwnerId,
        debtAssignment.amount,
        debtAssignment.direction,
        transactionDate,
        description,
        client,
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
  private setTransactionStatus(paymentMonth: Date): Status {
    switch (true) {
      case checkCurrentMonth(paymentMonth):
        return Status.CURRENT;
      case isPastMonth(paymentMonth):
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
        await this.transactionsRepository.runInTransaction(async (tx) => {
          const newTransaction = await this.transactionsRepository.create(
            {
              status: this.setTransactionStatus(paymentMonth),
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
            },
            tx,
          );
          await this.createTransactionsBD(newTransaction.id, tx);

          await this.handleDebtOwners(
            newTransaction.id,
            paymentMonth,
            debtAssigmentsDto,
            newTransaction.group.name,
            tx,
          );
          const refreshed = await this.transactionsRepository.findById(
            newTransaction.id,
          );
          if (!refreshed) throw new NotFoundException(`Transaction not found.`);
          newTransactions.push(transactionToResponseDto(refreshed));
        });
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
      const response = await this.transactionsRepository.runInTransaction(
        async (tx) => {
          const newTransaction = await this.transactionsRepository.create(
            {
              status: this.setTransactionStatus(installmentPaymentMonth),
              entryType: EntryType.EXPENSE,
              transactionDate,
              paymentMonth: installmentPaymentMonth,
              comment,
              currency,
              exchangeRate,
              installments,
              installment,
              totalAmount,
              monthlyAmount,
              impactsCashflow,
              ...inflation,
              category: { connect: { id: categoryId } },
              ledger: { connect: { id: ledgerId } },
              group: { connect: { id: groupId } },
              paymentMethod: { connect: { id: paymentMethodId } },
            },
            tx,
          );
          const tbd = await this.createTransactionsBD(newTransaction.id, tx);
          const resp = transactionToResponseDto(newTransaction);
          resp.transactionsBreakDown = tbd;
          return resp;
        },
      );
      newTransactions.push(response);
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

  private bundleAmountForMonth(
    base: number,
    monthOffset: number,
    increaseRate: number,
    increaseEveryMonths?: number,
  ): number {
    const step =
      increaseEveryMonths && increaseEveryMonths >= 1 ? increaseEveryMonths : 1;
    const bumps = Math.floor(monthOffset / step);
    return base * (1 + increaseRate) ** bumps;
  }

  //Helper: create a bundle of a recurrent transaction
  private async createBundle(
    fixedBundleDto: FixedBundleDto,
    paymentMonth: Date,
    ledgerId: number,
    categoryId: number,
    groupId: number,
    paymentMethodId: number,
    currency: Currency,
    ledgerCurrency: Currency,
    entryType: EntryType,
    totalProvidedAmount: number,
    baseCpiIndex: number,
    debtAssignments: DebtAssignmentDto[],
    comment?: string,
    exchangeRate?: number,
  ): Promise<TransactionResponseDto[]> {
    if (!fixedBundleDto.bundleTo)
      throw new BadRequestException('select period range');
    const increaseRate = fixedBundleDto.increaseRate ?? 0;

    const increaseEveryMonths = fixedBundleDto.increaseEveryMonths;

    const upto: Date = parsePeriod(fixedBundleDto.bundleTo);

    const periodRange: Date[] = monthRange(paymentMonth, upto);

    return await this.transactionsRepository.runInTransaction(
      async (tx) => {
        const results: TransactionResponseDto[] = [];
        for (let i = 0; i < periodRange.length; i++) {
          const month = periodRange[i];
          const totalAmount = this.assignTotalAmount(
            this.bundleAmountForMonth(
              totalProvidedAmount,
              i,
              increaseRate,
              increaseEveryMonths,
            ),
            currency,
            ledgerCurrency,
            exchangeRate,
          );
          const inflation = await this.getInflationData(
            ledgerCurrency,
            month,
            totalAmount,
            baseCpiIndex,
          );
          const created = await this.transactionsRepository.create(
            {
              status: this.setTransactionStatus(month),
              entryType,
              transactionDate: month,
              paymentMonth: month,
              comment,
              currency,
              exchangeRate,
              installments: 1,
              installment: 1,
              totalAmount,
              monthlyAmount: totalAmount,
              impactsCashflow: false,
              ...inflation,
              category: { connect: { id: categoryId } },
              ledger: { connect: { id: ledgerId } },
              group: { connect: { id: groupId } },
              paymentMethod: { connect: { id: paymentMethodId } },
            },
            tx,
          );
          const tbd = await this.createTransactionsBD(created.id, tx);
          if (debtAssignments.length)
            await this.handleDebtOwners(
              created.id,
              month,
              debtAssignments,
              created.group.name,
              tx,
            );
          const resp = transactionToResponseDto(created);
          resp.transactionsBreakDown = tbd;
          results.push(resp);
        }
        return results;
      },
      { timeout: 30_000 },
    );
  }

  /////////////////////////////////////////////////////////////////////

  // Create an expense transaction, with merge-on-current-month behavior.
  async createExpense(
    ledgerId: number,
    createTransactionDto: CreateTransactionDto,
    fixedBundleDto?: FixedBundleDto,
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
      transactionTypeEntry,
      exchangeRate,
      totalProvidedAmount,
      weekNumber,
      impactsCashflow,
      debtAssignments,
    } = createTransactionDto;
    const ledger = await this.ledgersService.findOneMinimal(ledgerId);

    const transactionType = transactionTypeEntry ?? TransactionType.VARIABLE;

    // Enforce exchange rate when currencies differ.
    if (currency != ledger.currency && !exchangeRate)
      throw new BadRequestException(`You must provide the exchange rate.`);

    // Current month + non-credit-card: merge into existing transaction.
    if (checkCurrentMonth(parseDate(transactionDate))) {
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
        const debtDescription = existing.group.name;

        if (debtAssignments.length != 0) {
          return await this.transactionsRepository.runInTransaction(
            async (tx) => {
              await this.handleDebtOwners(
                updated.id,
                updated.paymentMonth,
                debtAssignments,
                debtDescription,
                tx,
              );
              const refreshed = await this.transactionsRepository.findById(
                updated.id,
              );
              if (!refreshed)
                throw new NotFoundException(`Transaction not found.`);
              return transactionToResponseDto(refreshed);
            },
          );
        }
        return transactionToResponseDto(updated);
      }
    }
    // Default payment month to transaction date when not provided.
    const paymentMonth = paymentMonthValue
      ? parsePeriod(paymentMonthValue)
      : parseDate(transactionDate);
    // If installments are provided, delegate to the installment flow.

    if (installments > 1) {
      console.log(`Heading to installments`);

      return await this.handleInstallments(
        installments,
        totalProvidedAmount,
        currency,
        ledger.currency,
        ledger.baseCpiIndex,
        parseDate(transactionDate),
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
    }

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

    // fixed transactions
    if (transactionType === TransactionType.FIXED) {
      if (!fixedBundleDto?.bundleTo)
        throw new BadRequestException('select period range');

      return await this.createBundle(
        fixedBundleDto,
        paymentMonth,
        ledgerId,
        categoryId,
        groupId,
        paymentMethodId,
        currency,
        ledger.currency,
        EntryType.EXPENSE,
        totalProvidedAmount,
        ledger.baseCpiIndex,
        debtAssignments,
        comment,
        exchangeRate,
      );
    }

    // Single transaction with debt.
    if (debtAssignments.length != 0) {
      return await this.transactionsRepository.runInTransaction(async (tx) => {
        const newTransaction = await this.transactionsRepository.create(
          {
            status: this.setTransactionStatus(paymentMonth),
            entryType: EntryType.EXPENSE,
            transactionDate: parseDate(transactionDate),
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
          },
          tx,
        );
        await this.createTransactionsBD(newTransaction.id, tx);

        await this.handleDebtOwners(
          newTransaction.id,
          newTransaction.paymentMonth,
          debtAssignments,
          newTransaction.group.name,
          tx,
        );
        const refreshed = await this.transactionsRepository.findById(
          newTransaction.id,
        );
        if (!refreshed) throw new NotFoundException(`Transaction not found.`);

        return transactionToResponseDto(refreshed);
      });
    }
    // Single transaction without debt.

    const status = this.setTransactionStatus(paymentMonth);
    return await this.transactionsRepository.runInTransaction(async (tx) => {
      const newTransaction = await this.transactionsRepository.create(
        {
          status,
          entryType: EntryType.EXPENSE,
          transactionDate: parseDate(transactionDate),
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
        },
        tx,
      );

      const tbd = await this.createTransactionsBD(newTransaction.id, tx);
      const response = transactionToResponseDto(newTransaction);
      response.transactionsBreakDown = tbd;
      return response;
    });
  }

  async createIncome(
    ledgerId: number,
    createIncomeDto: CreateIncomeDto,
    fixedBundleDto?: FixedBundleDto,
  ): Promise<TransactionResponseDto | TransactionResponseDto[]> {
    const {
      categoryId,
      groupId,
      paymentMethodId,
      transactionDate,
      paymentMonthValue,
      comment,
      currency,
      transactionTypeEntry,
      exchangeRate,
      totalProvidedAmount,
      impactsCashflow,
    } = createIncomeDto;
    const ledger = await this.ledgersService.findOneMinimal(ledgerId);

    const transactionType = transactionTypeEntry ?? TransactionType.VARIABLE;

    // Enforce exchange rate when currencies differ.
    if (currency != ledger.currency && !exchangeRate)
      throw new BadRequestException(`You must provide the exchange rate.`);

    // Default payment month to transaction date when not provided.
    const paymentMonth = paymentMonthValue
      ? parsePeriod(paymentMonthValue)
      : parseDate(transactionDate);

    const totalAmount = this.assignTotalAmount(
      totalProvidedAmount,
      currency,
      ledger.currency,
      exchangeRate,
    );

    // fixed transactions
    if (transactionType === TransactionType.FIXED) {
      if (!fixedBundleDto?.bundleTo)
        throw new BadRequestException('select period range');
      return await this.createBundle(
        fixedBundleDto,
        paymentMonth,
        ledgerId,
        categoryId,
        groupId,
        paymentMethodId,
        currency,
        ledger.currency,
        EntryType.INCOME,
        totalProvidedAmount,
        ledger.baseCpiIndex,
        [],
        comment,
        exchangeRate,
      );
    }

    const inflation = await this.getInflationData(
      ledger.currency,
      paymentMonth,
      totalAmount,
      ledger.baseCpiIndex,
    );

    return await this.transactionsRepository.runInTransaction(async (tx) => {
      const newTransaction = await this.transactionsRepository.create(
        {
          status: this.setTransactionStatus(paymentMonth),
          entryType: EntryType.INCOME,
          transactionDate: parseDate(transactionDate),
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
        },
        tx,
      );

      const tbd = await this.createTransactionsBD(newTransaction.id, tx);
      const response = transactionToResponseDto(newTransaction);
      response.transactionsBreakDown = tbd;
      return response;
    });
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
    skip: number = 0,
    take: number = 50,
    filters: FilterTransactionsDto = {},
  ): Promise<TransactionResponseDto[]> {
    const where: Prisma.TransactionWhereInput = { ledgerId };

    if (filters.status) where.status = filters.status;
    if (filters.entryType) where.entryType = filters.entryType;
    if (filters.categoryId) where.categoryId = Number(filters.categoryId);
    if (filters.groupId) where.groupId = Number(filters.groupId);
    if (filters.paymentMethodId)
      where.paymentMethodId = Number(filters.paymentMethodId);
    if (filters.isPaid !== undefined) where.isPaid = filters.isPaid;

    if (filters.paymentMonth) {
      const startOfMonth = parsePeriod(filters.paymentMonth);
      // Advance one month to build an exclusive upper bound
      const startOfNextMonth = new Date(startOfMonth);
      startOfNextMonth.setUTCMonth(startOfNextMonth.getUTCMonth() + 1);
      where.paymentMonth = { gte: startOfMonth, lt: startOfNextMonth };
    }

    const transactions = await this.transactionsRepository.findAllByPaginated(
      where,
      skip,
      take,
      { transactionDate: 'asc' },
    );

    return transactionArrayToArrayDto(transactions);
  }

  async updateFlags(
    id: number,
    dto: UpdateTransactionFlagsDto,
  ): Promise<TransactionResponseDto> {
    const data: Prisma.TransactionUpdateInput = {};
    if (dto.isPaid !== undefined) data.isPaid = dto.isPaid;
    if (dto.impactsCashflow !== undefined)
      data.impactsCashflow = dto.impactsCashflow;
    const updated = await this.transactionsRepository.update(id, data);
    return transactionToResponseDto(updated);
  }

  async updateCore(
    id: number,
    dto: UpdateTransactionCoreDto,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.transactionsRepository.findById(id);
    if (!transaction)
      throw new NotFoundException(`Transaction with id: ${id} not found.`);

    const data: Prisma.TransactionUpdateInput = {};
    const paymentMonth = dto.paymentMonthValue
      ? parseDate(dto.paymentMonthValue)
      : dto.transactionDate
        ? parseDate(dto.transactionDate)
        : transaction.paymentMonth;

    if (dto.comment !== undefined) data.comment = dto.comment || null;
    if (dto.transactionDate) {
      data.transactionDate = parseDate(dto.transactionDate);
    }
    if (dto.categoryId) data.category = { connect: { id: dto.categoryId } };
    if (dto.groupId) data.group = { connect: { id: dto.groupId } };
    if (dto.paymentMethodId)
      data.paymentMethod = { connect: { id: dto.paymentMethodId } };
    if (dto.paymentMonthValue || dto.transactionDate)
      data.status = this.setTransactionStatus(paymentMonth);
    if (dto.totalProvidedAmount !== undefined || dto.paymentMonthValue) {
      const ledger = await this.ledgersService.findOneMinimal(
        transaction.ledgerId,
      );
      const newTotal =
        dto.totalProvidedAmount ?? Number(transaction.totalAmount);
      const paymentMonth = dto.paymentMonthValue
        ? parsePeriod(dto.paymentMonthValue)
        : transaction.paymentMonth;
      const inflation = await this.getInflationData(
        ledger.currency,
        paymentMonth,
        newTotal,
        ledger.baseCpiIndex,
      );
      data.totalAmount = newTotal;
      data.monthlyAmount = newTotal;
      data.paymentMonth = paymentMonth;
      Object.assign(data, inflation);
    }

    const updated = await this.transactionsRepository.update(id, data);
    return transactionToResponseDto(updated);
  }

  async deleteTransaction(id: number): Promise<void> {
    await this.transactionsRepository.delete(id);
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
