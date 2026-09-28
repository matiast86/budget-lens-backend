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
  getNextMonth,
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
import { CategoriesService } from '../categories/categories.service';
import { GroupsService } from '../groups/groups.service';
import { InflationIndexesService } from '../inflation-indexes/inflation-indexes.service';
import { LedgersService } from '../ledgers/ledgers.service';
import { PaymentMethodsService } from '../payment-methods/payment-methods.service';
import { AssignBreakDownDto } from '../transactions-break-down/dto/assign-break-down.dto';
import { TransactionBreakDownResponseDto } from '../transactions-break-down/dto/transaction-break-down-response.dto';
import { TransactionsBreakDownService } from '../transactions-break-down/transactions-break-down.service';
import { FixedBundleDto } from './dto/bundle-dtos/fixed-bundle.dto';
import { ProjectedSeriesDto } from './dto/bundle-dtos/projected-series.dto';
import { ProjectionsDto } from './dto/bundle-dtos/projections.dto';
import { CreateBalanceDto } from './dto/create-balance.dto';
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
    private readonly categoriesService: CategoriesService,
    private readonly groupsService: GroupsService,
  ) {}

  // Helper: create 4 weekly breakdown rows for a new transaction.
  async createTransactionsBD(
    transactionId: number,
    client: Prisma.TransactionClient,
  ): Promise<TransactionBreakDownResponseDto[]> {
    return await this.transactionBDService.createBundle(transactionId, client);
  }

  // Helper: record a debt entry tied to the transaction context.
  private async handleDebtOwners(
    transactionId: number,
    transactionDate: Date,
    debtAssignmentsDto: DebtAssignmentDto[],
    description: string,
    client: Prisma.TransactionClient,
    totalAmount: number,
  ): Promise<void> {
    for (const debtAssignment of debtAssignmentsDto) {
      let amount: number;
      if (debtAssignment.amount != null) {
        amount = debtAssignment.amount;
      } else if (debtAssignment.percentage != null) {
        amount = totalAmount * debtAssignment.percentage;
      } else {
        throw new BadRequestException(
          `Debt assignment for owner ${debtAssignment.debtOwnerId} needs amount or percentage`,
        );
      }

      await this.transactionsRepository.createTransactionDebtOwner(
        transactionId,
        debtAssignment.debtOwnerId,
        amount,
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
            totalAmount,
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

  //Helper: create a bundleRows of a recurrent transaction
  private async createBundleRows(
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
    tx: Prisma.TransactionClient,
    comment?: string,
    exchangeRate?: number,
  ): Promise<TransactionResponseDto[]> {
    if (!fixedBundleDto.bundleTo)
      throw new BadRequestException('select period range');
    const increaseRate = fixedBundleDto.increaseRate ?? 0;

    const increaseEveryMonths = fixedBundleDto.increaseEveryMonths;

    const upto: Date = parsePeriod(fixedBundleDto.bundleTo);

    const periodRange: Date[] = monthRange(paymentMonth, upto);

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
          totalAmount,
        );
      const resp = transactionToResponseDto(created);
      resp.transactionsBreakDown = tbd;
      results.push(resp);
    }
    return results;
  }

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
    return this.transactionsRepository.runInTransaction(
      (tx) =>
        this.createBundleRows(
          fixedBundleDto,
          paymentMonth,
          ledgerId,
          categoryId,
          groupId,
          paymentMethodId,
          currency,
          ledgerCurrency,
          entryType,
          totalProvidedAmount,
          baseCpiIndex,
          debtAssignments,
          tx,
          comment,
          exchangeRate,
        ),
      {
        timeout: 30_000,
      },
    );
  }

  // Helper: reject a source basket that would create a derivation cycle.
  private async assertNoCycle(
    derivedId: number | undefined,
    sourceIds: number[],
    client: Prisma.TransactionClient,
  ): Promise<void> {
    // 1. If derivedId is undefined (first-time create), there is nothing
    //    upstream of it yet — return immediately.
    // 2. Walk forward from derivedId through its FeedsDerived links —
    //    i.e. everything derivedId itself feeds — transitively, collecting
    //    every reachable transaction id (BFS/DFS, guard against revisits).
    // 3. If any id in that reachable set also appears in sourceIds, throw
    //    BadRequestException — linking it would make derivedId (indirectly)
    //    a source of itself.
  }

  // Helper: recompute one derived transaction from its current source links.
  // Called directly (manual recalculate) and recursively when a derived row
  // itself feeds another derived row.
  private async recalculateFromSources(
    derivedId: number,
    client: Prisma.TransactionClient,
    visited: Set<number> = new Set(),
  ): Promise<void> {
    // 1. If derivedId is already in `visited`, return (cycle/re-entry guard);
    //    otherwise add it. Also stop past a hard depth cap (~10) if tracking
    //    depth instead of/in addition to a visited set.
    // 2. Load the derived transaction by id (via client, not the pool).
    // 3. If derivationRate is null or it has no derivedFrom links, return —
    //    it isn't derived (or was detached), nothing to recompute.
    // 4. Load its links via findDerivationsByDerived(derivedId, client) —
    //    this includes each linked `source` transaction.
    // 5. base = sum of those sources' totalAmount.
    // 6. newTotal = assignTotalAmount(base * derivationRate, derived.currency,
    //    ledger.currency, derived.exchangeRate) — fetch the ledger the same
    //    way updateCore does.
    // 7. inflation = getInflationData(ledger.currency, derived.paymentMonth,
    //    newTotal, ledger.baseCpiIndex).
    // 8. repository.update(derivedId, { totalAmount: newTotal, monthlyAmount:
    //    newTotal, ...inflation }, client).
    // 9. Rewrite the W1-W4 breakdown so it still sums to newTotal:
    //    - proportionally rescale each existing week
    //      (newWk = oldWk * newTotal / oldTotal);
    //    - if oldTotal is 0 (all weeks empty), put the full amount in the
    //      week matching the row's transactionDate (getWeekofMonth),
    //      falling back to week 1;
    //    - write each via transactionBDService.update(bd.id, { amount }, client).
    // 10. Recurse: this row may itself be a source for other derived rows —
    //     call recalculateDerived(derivedId, client, visited).
  }

  // Helper: "a source transaction changed — refresh everything downstream."
  private async recalculateDerived(
    sourceId: number,
    client: Prisma.TransactionClient,
    visited: Set<number> = new Set(),
  ): Promise<void> {
    // 1. Fetch its dependents via findDerivationsBySource(sourceId, client).
    // 2. Reduce to the distinct set of derivedId values.
    // 3. For each distinct derivedId, call recalculateFromSources(derivedId,
    //    client, visited) — sequentially (not Promise.all): they share one
    //    interactive tx client, same convention as handleDebtOwners' loop.
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
        // TODO (derived-transaction hook): this merge just changed
        // existing.totalAmount — call recalculateDerived(existing.id, tx)
        // inside whichever runInTransaction ends up wrapping this branch
        // (today only the debt-assignment sub-case below opens one; the
        // no-debt return path a few lines down would need its own tx too).
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
                updatedTotal,
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
          totalAmount,
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

  // Create an expense whose amount is `derivationRate * sum(source
  // transactions' totalAmount)`, either as a single row or as a monthly
  // series when transactionTypeEntry===FIXED + fixedBundleDto.bundleTo is set.
  // dto: CreateTransactionDto & FixedBundleDto & { sourceTransactionIds: number[]; derivationRate: number }
  async createDerivedExpense(
    ledgerId: number,
    dto: any, // TODO: replace `any` with CreateDerivedTransactionDto once it exists
  ): Promise<TransactionResponseDto | TransactionResponseDto[]> {
    // 1. Load the ledger (ledgersService.findOneMinimal).
    // 2. Enforce currency !== ledger.currency && !exchangeRate -> 400,
    //    same rule as createExpense/createIncome.
    // 3. Fetch the source transactions: repository.findByIds(dto.sourceTransactionIds).
    // 4. Validate the basket: non-empty, every source's ledgerId matches
    //    ledgerId, every source's currency matches dto.currency (v0: no
    //    mixed-currency baskets) — 404/400 otherwise.
    // 5. assertNoCycle(undefined, dto.sourceTransactionIds, ...) — a no-op on
    //    first create today, but keeps the guard exercised for when an
    //    existing transaction can later be re-linked.
    //
    // 6. SINGLE PATH — transactionTypeEntry !== FIXED, or no bundleTo:
    //    a. base = sum of sources' totalAmount.
    //    b. total = assignTotalAmount(base * dto.derivationRate, dto.currency,
    //       ledger.currency, dto.exchangeRate).
    //    c. Open runInTransaction:
    //       - build + create the transaction row (entryType EXPENSE,
    //         derivationRate: dto.derivationRate, impactsCashflow from dto,
    //         default true) — reuse the same create-input shape createExpense
    //         builds inline.
    //       - createTransactionsBD (the 4 weekly rows).
    //       - createDerivationLink(newId, sourceId, tx) for each source id.
    //       - getInflationData + spread it onto the create.
    //       - return the mapped TransactionResponseDto.
    //
    // 7. SERIES PATH — transactionTypeEntry === FIXED and bundleTo is set:
    //    a. months = monthRange(paymentMonth, parsePeriod(dto.bundleTo)).
    //    b. Idempotency: repository.findDerivedInRange(...) -> 400 on collision.
    //    c. Open one runInTransaction({ timeout: 30_000 }) wrapping the whole loop.
    //    d. For each month M:
    //       - resolve each source's sibling row for M via
    //         repository.findSiblingForMonth(...).
    //       - base_M = sum of the resolved siblings' totalAmount; if none
    //         resolve for M, skip that month entirely (no 0-amount row).
    //       - create the derived row for M + its breakdown + a
    //         createDerivationLink to each resolved sibling.
    //       - unlike createBundleRows, do NOT force impactsCashflow: false —
    //         honor dto.impactsCashflow (default true); a tax/fee you
    //         actually pay impacts cashflow.
    //    e. Return the created rows.
    return undefined as any;
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
    // TODO (derived-transaction hook): wrap this method's writes in
    // runInTransaction and call recalculateDerived(transaction.id, tx) here
    // — this method just changed totalAmount, so anything derived from this
    // row needs to be refreshed too.

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
    // TODO (derived-transaction hooks):
    // - Wrap this whole method's mutation in runInTransaction so the detach
    //   and the cascade below commit atomically with the core update.
    // - Detach rule: if `transaction` has derivedFrom links AND
    //   dto.totalProvidedAmount !== undefined, delete its derivation links
    //   (deleteDerivationLinksByDerived(id, tx)) and clear derivationRate to
    //   null *before* applying the manual amount below — a direct amount
    //   edit detaches the row from its sources.
    // - Cascade: after repository.update, if the amount/paymentMonth branch
    //   ran (i.e. data.totalAmount was set), call
    //   recalculateDerived(id, tx) — something might feed off this row too.
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
    // TODO (derived-transaction hook): if data.totalAmount was set above,
    // call recalculateDerived(id, tx) here, before returning — something
    // might be derived from this row.
    return transactionToResponseDto(updated);
  }

  async deleteTransaction(id: number): Promise<void> {
    // TODO (derived-transaction hook): wrap this in runInTransaction and:
    // 1. Delete this row's own derivedFrom links first
    //    (deleteDerivationLinksByDerived(id, tx)) so its own delete below
    //    isn't blocked by the RESTRICT FK.
    // 2. Look up who this row feeds — findDerivationsBySource(id, tx) —
    //    capture the distinct derivedId set, then delete those link rows too
    //    (so the FK on the source side is clear).
    // 3. repository.delete(id, tx).
    // 4. For each derivedId captured in step 2, call
    //    recalculateFromSources(derivedId, tx) — it now has one fewer
    //    source (or zero, in which case its amount recomputes to 0 and the
    //    row is left for the user to delete or re-link).
    await this.transactionsRepository.delete(id);
  }

  // POST /transactions/:id/recalculate — force a derived row back in sync
  // with its current sources, independent of the automatic cascade.
  async recalculateById(id: number): Promise<TransactionResponseDto> {
    // 1. runInTransaction:
    //    - recalculateFromSources(id, tx).
    //    - re-fetch the row (repository.findById or a client-aware
    //      equivalent) and return its mapped TransactionResponseDto.
    // 2. 404 if the row doesn't exist.
    // 3. If it isn't derived (derivationRate is null), just return it
    //    unchanged rather than throwing — recalculate is a no-op, not an error.
    return undefined as any;
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

  async createBalance(
    ledgerId: number,
    createBalanceDto: CreateBalanceDto,
  ): Promise<TransactionResponseDto[]> {
    const { paymentMethodId, paymentMonthValue, bundleTo, currency } =
      createBalanceDto;

    const ledger = await this.ledgersService.findOneMinimal(ledgerId);
    const paymentMonth = parsePeriod(paymentMonthValue);
    const category = await this.categoriesService.findOneByName(
      ledgerId,
      'Balance',
    );
    const paymentMethodName = (
      await this.paymentMethodService.findById(paymentMethodId)
    ).name;

    const upto = parsePeriod(bundleTo);

    // Horizon guard — balance scaffolding is a planning window, not years.
    const span =
      (upto.getUTCFullYear() - paymentMonth.getUTCFullYear()) * 12 +
      (upto.getUTCMonth() - paymentMonth.getUTCMonth());
    if (span < 0)
      throw new BadRequestException(
        'bundleTo must not precede paymentMonthValue',
      );
    if (span > 23)
      throw new BadRequestException('balance range cannot exceed 24 months');

    const groupName = `${paymentMethodName} balance`;
    const userId = ledger.ownerId;

    let group = await this.groupsService.findGroupByName(ledgerId, groupName);

    if (!group) {
      group = await this.groupsService.create(userId, ledgerId, {
        name: groupName,
      });
    }
    const existing = await this.transactionsRepository.findBalanceInRange(
      ledgerId,
      category.id,
      paymentMethodId,
      paymentMonth,
      upto,
    );
    if (existing.length)
      throw new BadRequestException(
        'balance tracking already exists for this payment method in that range',
      );

    return await this.createBundle(
      { bundleTo },
      paymentMonth,
      ledgerId,
      category.id,
      group.id,
      paymentMethodId,
      currency,
      ledger.currency,
      EntryType.INCOME,
      0,
      ledger.baseCpiIndex,
      [],
      '',
      1,
    );
  }

  async projectFixedExpensesForward(
    ledgerId: number,
    projectionsDto: ProjectionsDto,
  ): Promise<ProjectedSeriesDto[]> {
    const {
      categoryId,
      groupId,
      paymentMethodId,
      comment,
      currency,
      exchangeRate,
      fixedBundleDto,
    } = projectionsDto;

    if (!fixedBundleDto?.bundleTo)
      throw new BadRequestException('Select the projection horizon');

    const ledger = await this.ledgersService.findOneMinimal(ledgerId);

    // 1. find the planning frontier and fixed lines - derived, not passed
    const templates =
      await this.transactionsRepository.findLatestFixedByGroupAndCategory(
        groupId,
        categoryId,
        currency,
        EntryType.EXPENSE,
      );

    if (!templates.length)
      throw new BadRequestException(
        'no planned fixed transactions to extend from for this group/category',
      );
    const frontier = templates[0].paymentMonth;
    const start = getNextMonth(frontier);
    const upto = parsePeriod(fixedBundleDto.bundleTo);

    //2. Horizon guard
    const span =
      (upto.getUTCFullYear() - start.getUTCFullYear()) * 12 +
      (upto.getUTCMonth() - start.getUTCMonth());

    if (span < 0)
      throw new BadRequestException(
        'bundleTo must not precede the planning frontier',
      );
    if (span > 23)
      throw new BadRequestException('projection range cannot exceed 24 months');

    // 3. Idempotency — don't stack a second copy on re-run.
    const collisions = await this.transactionsRepository.findFixedInRange(
      ledgerId,
      groupId,
      categoryId,
      currency,
      EntryType.EXPENSE,
      start,
      upto,
    );

    if (collisions.length)
      throw new BadRequestException(
        'fixed transactions are already planned in that range',
      );
    const seedRate = fixedBundleDto.seedIncreaseRate ?? 0;

    // 4. One transaction for the whole projection, not one per line.
    return this.transactionsRepository.runInTransaction(
      async (tx) => {
        const out: ProjectedSeriesDto[] = [];
        for (const template of templates) {
          const seed = Number(template.totalAmount) * (1 + seedRate);
          const projected = await this.createBundleRows(
            fixedBundleDto,
            start,
            ledgerId,
            categoryId,
            groupId,
            template.paymentMethodId ?? paymentMethodId,
            currency,
            ledger.currency,
            EntryType.EXPENSE,
            seed,
            ledger.baseCpiIndex,
            [],
            tx,
            comment ?? template.comment ?? '',
            exchangeRate,
          );

          out.push(
            new ProjectedSeriesDto({
              sourceId: template.id,
              sourceMonth: frontier,
              projected,
            }),
          );
        }
        return out;
      },
      { timeout: 30_000 },
    );
  }
}
