import { Injectable } from '@nestjs/common';
import { EntryType } from 'prisma/generated/prisma/enums';
import { getWeekofMonth, parsePeriod } from 'src/helpers/dates';
import {
  createCashflowPeriodAmount,
  extractCategories,
  extractGroups,
  extractPaymentMethods,
  extractPeriods,
} from 'src/helpers/reports';
import { TransactionReport } from 'src/types/entities/transaction.types';
import { CashflowReportDto } from './dto/cashflow-report.dto';
import { CashflowCategoryDto } from './dto/cashflow/cashflow-category.dto';
import { CashflowEntryTypeDto } from './dto/cashflow/cashflow-entry-type.dto';
import { CashflowGroupDto } from './dto/cashflow/cashflow-group.dto';
import { CashflowMetaDto } from './dto/cashflow/cashflow-meta.dto';
import { CashflowPaymentMethodDto } from './dto/cashflow/cashflow-payment-method.dto';
import { CategoryEvolutionReportDto } from './dto/category-evolution-report.dto';
import { DebtReportDto } from './dto/debt-report.dto';
import { ReportsRepository } from './reports.repository';

@Injectable()
export class ReportsService {
  constructor(private readonly reportsRepository: ReportsRepository) {}

  //helper methods
  private createCashflowEntryType = (
    periods: string[],
    transactions: TransactionReport[],
  ): CashflowEntryTypeDto => {
    //get cashflow Entry type
    // get cashflowPeriodAmount for entry type
    const entryTypePeriodAmount = createCashflowPeriodAmount(
      periods,
      transactions,
    );

    //get cashflow payment methods for entry type
    const paymentMethods = extractPaymentMethods(transactions);
    const cashflowPaymentMethods: CashflowPaymentMethodDto[] = [];
    for (const method of paymentMethods) {
      const pmTransactions = transactions.filter(
        (t) => t.paymentMethod.name === method,
      );
      const id = pmTransactions[0].paymentMethodId;
      const total = createCashflowPeriodAmount(periods, pmTransactions);

      //get cashflow category for payment methods
      const cashFlowCategories: CashflowCategoryDto[] = [];
      const categories = extractCategories(pmTransactions);
      for (const c of categories) {
        const catTransactions = pmTransactions.filter(
          (t) => t.category.name === c,
        );
        const id = catTransactions[0].categoryId;
        const total = createCashflowPeriodAmount(periods, catTransactions);
        //get cashflow group for categories
        const cashflowGroups: CashflowGroupDto[] = [];
        const groups = extractGroups(catTransactions);
        for (const g of groups) {
          const groupTransactions = catTransactions.filter(
            (t) => t.group.name === g,
          );
          const id = groupTransactions[0].groupId;
          const amounts = createCashflowPeriodAmount(
            periods,
            groupTransactions,
          );
          cashflowGroups.push(new CashflowGroupDto({ id, name: g, amounts }));
        }
        cashFlowCategories.push(
          new CashflowCategoryDto({
            id,
            name: c,
            total,
            groups: cashflowGroups,
          }),
        );
      }
      cashflowPaymentMethods.push(
        new CashflowPaymentMethodDto({
          id,
          name: method,
          total,
          categories: cashFlowCategories,
        }),
      );
    }
    return new CashflowEntryTypeDto({
      total: entryTypePeriodAmount,
      paymentMethods: cashflowPaymentMethods,
    });
  };

  /////////////////////////////////////////////////////////////////////////////////

  async getCashflow(
    ledgerId: number,
    fromString: string,
    toString: string,
  ): Promise<CashflowReportDto> {
    const from = parsePeriod(fromString);
    const to = parsePeriod(toString);
    const transactions: TransactionReport[] =
      await this.reportsRepository.getCashflowData(ledgerId, from, to);

    //get CashflowMetaDto info
    const periods = extractPeriods(transactions);
    const currentWeek = getWeekofMonth(new Date());
    const currency = transactions[0].ledger.currency;

    const meta = new CashflowMetaDto({
      periods,
      currentWeek,
      currency,
      from: fromString,
      to: toString,
    });

    const incomeTransactions = transactions.filter(
      (t) => t.entryType === EntryType.INCOME,
    );

    const expenseTransactions = transactions.filter(
      (t) => t.entryType === EntryType.EXPENSE,
    );

    const income = this.createCashflowEntryType(periods, incomeTransactions);
    const expense = this.createCashflowEntryType(periods, expenseTransactions);
    const grandTotal = createCashflowPeriodAmount(periods, transactions);
    return new CashflowReportDto({ meta, income, expense, grandTotal });
  }

  getDebtReport(
    _ledgerId: number,
    _from: string,
    _to: string,
  ): Promise<DebtReportDto> {
    return Promise.reject(new Error('Not implemented'));
  }

  getCategoryEvolution(
    _ledgerId: number,
    _from: string,
    _to: string,
  ): Promise<CategoryEvolutionReportDto> {
    return Promise.reject(new Error('Not implemented'));
  }
}
