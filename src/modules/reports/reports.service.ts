import { Injectable } from '@nestjs/common';
import { EntryType } from 'prisma/generated/prisma/enums';
import { getWeekofMonth, parsePeriod } from 'src/helpers/dates';
import {
  createCashflowPeriodAmount,
  extractDebtPeriodAmount,
  extractPeriodsFromOwners,
  extractPeriodsFromTransactions,
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
import { DebtDetailDto } from './dto/debt/debt-detail.dto';
import { DebtOwnerReportDto } from './dto/debt/debt-owner-report.dto';
import { DebtReportMetaDto } from './dto/debt/debt-report-meta.dto';
import { ReportsRepository } from './reports.repository';

@Injectable()
export class ReportsService {
  constructor(private readonly reportsRepository: ReportsRepository) {}

  //helper methods
  private createCashflowEntryType = (
    periods: string[],
    transactions: TransactionReport[],
    currentWeek: number,
  ): CashflowEntryTypeDto => {
    //get cashflow Entry type
    // get cashflowPeriodAmount for entry type
    const entryTypePeriodAmount = createCashflowPeriodAmount(
      periods,
      transactions,
      currentWeek,
    );
    const grouped = new Map<
      string,
      Map<string, Map<string, TransactionReport[]>>
    >();
    for (const t of transactions) {
      const pm = t.paymentMethod.name;
      const cat = t.category.name;
      const grp = t.group.name;

      if (!grouped.has(pm)) grouped.set(pm, new Map());
      if (!grouped.get(pm)!.has(cat)) grouped.get(pm)!.set(cat, new Map());
      if (!grouped.get(pm)!.get(cat)!.has(grp))
        grouped.get(pm)!.get(cat)!.set(grp, []);

      grouped.get(pm)!.get(cat)!.get(grp)!.push(t);
    }

    const cashflowPaymentMethods: CashflowPaymentMethodDto[] = [];

    for (const [pmName, catMap] of grouped) {
      const pmTxs = [...catMap.values()].flatMap((gm) =>
        [...gm.values()].flat(),
      );
      const pmId = pmTxs[0].paymentMethodId;
      const pmTotal = createCashflowPeriodAmount(periods, pmTxs, currentWeek);

      const cashFlowCategories: CashflowCategoryDto[] = [];
      for (const [catName, grpMap] of catMap) {
        // flatten group map to get this category's transactions
        const catTxs = [...grpMap.values()].flat();
        const catId = catTxs[0].categoryId;
        const catTotal = createCashflowPeriodAmount(
          periods,
          catTxs,
          currentWeek,
        );

        const cashflowGroups: CashflowGroupDto[] = [];
        for (const [grpName, grpTxs] of grpMap) {
          // already isolated — no filter at all
          const grpId = grpTxs[0].groupId;
          const amounts = createCashflowPeriodAmount(
            periods,
            grpTxs,
            currentWeek,
          );
          cashflowGroups.push(
            new CashflowGroupDto({ id: grpId, name: grpName, amounts }),
          );
        }
        cashFlowCategories.push(
          new CashflowCategoryDto({
            id: catId,
            name: catName,
            total: catTotal,
            groups: cashflowGroups,
          }),
        );
      }
      cashflowPaymentMethods.push(
        new CashflowPaymentMethodDto({
          id: pmId,
          name: pmName,
          total: pmTotal,
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
    const periods = extractPeriodsFromTransactions(transactions);
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

    const income = this.createCashflowEntryType(
      periods,
      incomeTransactions,
      currentWeek,
    );
    const expense = this.createCashflowEntryType(
      periods,
      expenseTransactions,
      currentWeek,
    );
    const grandTotal = createCashflowPeriodAmount(
      periods,
      transactions,
      currentWeek,
    );
    return new CashflowReportDto({ meta, income, expense, grandTotal });
  }

  async getDebtReport(
    ledgerId: number,
    fromString: string,
    toString: string,
  ): Promise<DebtReportDto> {
    const from = parsePeriod(fromString);
    const to = parsePeriod(toString);

    const response = await this.reportsRepository.getDebtData(
      ledgerId,
      from,
      to,
    );

    //get Debt Report Meta information
    const periods = extractPeriodsFromOwners(response.owners);

    const meta: DebtReportMetaDto = new DebtReportMetaDto({
      periods,
      from: fromString,
      to: toString,
      currency: response.currency,
    });

    // get owners report information
    const debtOwners = response.owners;
    const owners: DebtOwnerReportDto[] = [];
    for (const owner of debtOwners) {
      const id = owner.id;
      const name = owner.name;
      const transactions = owner.transactions;
      //get period amounts
      const total = extractDebtPeriodAmount(transactions, periods);

      // get debts information
      const descriptions = [
        ...new Set(transactions.map((t) => t.debt.description)),
      ];
      const debts: DebtDetailDto[] = [];
      for (const description of descriptions) {
        const filteredTransactions = transactions.filter(
          (t) => t.debt.description === description,
        );
        const amounts = extractDebtPeriodAmount(filteredTransactions, periods);
        debts.push(new DebtDetailDto({ description, amounts }));
      }
      owners.push(new DebtOwnerReportDto({ id, name, total, debts }));
    }
    const totalTransactions = debtOwners.flatMap((d) => d.transactions);
    const grandTotal = extractDebtPeriodAmount(totalTransactions, periods);
    return new DebtReportDto({ meta, owners, grandTotal });
  }

  async getCategoryEvolution(
    ledgerId: number,
    from: string,
    to: string,
  ): Promise<CategoryEvolutionReportDto> {
    return Promise.reject(new Error('Not implemented'));
  }
}
