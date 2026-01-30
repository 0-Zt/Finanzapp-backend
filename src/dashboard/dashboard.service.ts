import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DbPostgresqlService, QueryFilter } from 'src/shared/connection/db.postgresql.service';
import { UserProfileService, UserProfile, FixedExpense } from '../user-profile/user-profile.service';
import { MonthlyAutomationService } from '../monthly-automation/monthly-automation.service';

export interface DashboardResponse {
  transactions: any[];
  categories: any[];
  upcomingPayments: any[];
  financialGoals: any[];
  userProfile: UserProfile | null;
  fixedExpenses: FixedExpense[];
}

export interface CategorySummary {
  category_id: number | null;
  category_name: string;
  category_icon: string;
  category_color: string;
  total: number;
  percentage: number;
  transaction_count: number;
}

export interface MonthComparison {
  income_change_percentage: number | null;
  expense_change_percentage: number | null;
  savings_rate_change: number | null;
}

export interface MonthlySummaryResponse {
  month: string;
  total_income: number;
  total_expenses: number;
  net_balance: number;
  savings_rate: number;
  transaction_count: number;
  top_expense_categories: CategorySummary[];
  top_income_categories: CategorySummary[];
  comparison_with_previous_month: MonthComparison;
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly dbService: DbPostgresqlService,
    private readonly userProfileService: UserProfileService,
    private readonly monthlyAutomationService: MonthlyAutomationService,
  ) {}

  async getMonthlySummary(userId: string, month?: string, accessToken?: string): Promise<MonthlySummaryResponse> {
    try {
      const timezone = await this.getUserTimezone(userId, accessToken);
      const currentMonth = month && this.isValidMonthString(month) ? month : this.getCurrentMonth(timezone);
      const previousMonth = this.getPreviousMonth(currentMonth);

      // Fetch categories map
      const categories = await this.dbService.select('expense_categories', {}, {}, accessToken);
      const categoriesMap = new Map<number, { name: string; icon: string; icon_color: string }>();
      for (const cat of categories || []) {
        categoriesMap.set(cat.id, { name: cat.name, icon: cat.icon, icon_color: cat.icon_color });
      }

      // Fetch transactions for current and previous month in parallel
      const currentRange = this.getMonthDateRange(currentMonth);
      const previousRange = this.getMonthDateRange(previousMonth);

      const [currentTransactions, previousTransactions] = await Promise.all([
        this.fetchTransactionsForRange(userId, currentRange.start, currentRange.end, accessToken),
        this.fetchTransactionsForRange(userId, previousRange.start, previousRange.end, accessToken),
      ]);

      // Calculate current month totals
      const currentTotals = this.calculateMonthTotals(currentTransactions, categoriesMap);
      const previousTotals = this.calculateMonthTotals(previousTransactions, categoriesMap);

      // Comparison
      const comparison: MonthComparison = {
        income_change_percentage: previousTotals.income > 0
          ? Math.round(((currentTotals.income - previousTotals.income) / previousTotals.income) * 10000) / 100
          : null,
        expense_change_percentage: previousTotals.expenses > 0
          ? Math.round(((currentTotals.expenses - previousTotals.expenses) / previousTotals.expenses) * 10000) / 100
          : null,
        savings_rate_change:
          previousTotals.savingsRate !== null && currentTotals.savingsRate !== null
            ? Math.round((currentTotals.savingsRate - previousTotals.savingsRate) * 100) / 100
            : null,
      };

      return {
        month: currentMonth,
        total_income: currentTotals.income,
        total_expenses: currentTotals.expenses,
        net_balance: Math.round((currentTotals.income - currentTotals.expenses) * 100) / 100,
        savings_rate: currentTotals.savingsRate ?? 0,
        transaction_count: currentTransactions.length,
        top_expense_categories: currentTotals.expenseCategories.slice(0, 5),
        top_income_categories: currentTotals.incomeCategories.slice(0, 5),
        comparison_with_previous_month: comparison,
      };
    } catch (error) {
      this.logger.error('Error al obtener resumen mensual', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async getDashboard(userId: string, limit: number = 6, accessToken?: string): Promise<DashboardResponse> {
    try {
      // Run monthly automations before fetching data (idempotent, non-blocking)
      await this.monthlyAutomationService.runIfNeeded(userId, accessToken);

      const [transactions, categories, upcomingPayments, financialGoals, userProfile, fixedExpenses] = await Promise.all([
        this.dbService.select(
          'transactions',
          { user_id: userId },
          { orderBy: 'transaction_date', order: 'desc', limit },
          accessToken
        ),
        this.dbService.select('expense_categories', {}, {}, accessToken),
        this.dbService.select('upcoming_payments', { user_id: userId }, {}, accessToken),
        this.dbService.select('financial_goals', { user_id: userId }, {}, accessToken),
        this.userProfileService.getProfile(userId, undefined, undefined, accessToken).catch(() => null),
        this.userProfileService.getFixedExpenses(userId, accessToken).catch(() => []),
      ]);

      return { transactions, categories, upcomingPayments, financialGoals, userProfile, fixedExpenses };
    } catch (error) {
      this.logger.error('Error al cargar el dashboard', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  // ─── Private helpers for monthly summary ────────────────────────

  private async getUserTimezone(userId: string, accessToken?: string): Promise<string> {
    try {
      const profile = await this.userProfileService.getProfile(userId, undefined, undefined, accessToken);
      return profile.timezone || 'UTC';
    } catch {
      return 'UTC';
    }
  }

  private getCurrentMonth(timezone: string): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
    });
    const parts = formatter.formatToParts(new Date());
    const year = parts.find((p) => p.type === 'year')!.value;
    const month = parts.find((p) => p.type === 'month')!.value;
    return `${year}-${month}`;
  }

  private isValidMonthString(month: string): boolean {
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return false;
    }

    const [yearStr, monthStr] = month.split('-');
    const year = Number(yearStr);
    const monthNum = Number(monthStr);

    if (!Number.isInteger(year) || !Number.isInteger(monthNum)) {
      return false;
    }

    return monthNum >= 1 && monthNum <= 12;
  }

  private getPreviousMonth(month: string): string {
    const [yearStr, monthStr] = month.split('-');
    const date = new Date(Date.UTC(parseInt(yearStr), parseInt(monthStr) - 1, 1));
    date.setUTCMonth(date.getUTCMonth() - 1);
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  private getMonthDateRange(month: string): { start: string; end: string } {
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr);
    const monthIndex = parseInt(monthStr) - 1;
    const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    return {
      start: `${month}-01`,
      end: `${month}-${String(lastDay).padStart(2, '0')}`,
    };
  }

  private async fetchTransactionsForRange(
    userId: string,
    start: string,
    end: string,
    accessToken?: string,
  ): Promise<any[]> {
    const filters: QueryFilter[] = [
      { column: 'user_id', operator: 'eq', value: userId },
      { column: 'transaction_date', operator: 'gte', value: start },
      { column: 'transaction_date', operator: 'lte', value: end },
    ];
    return await this.dbService.selectWithFilters('transactions', filters, {}, accessToken) || [];
  }

  private calculateMonthTotals(
    transactions: any[],
    categoriesMap: Map<number, { name: string; icon: string; icon_color: string }>,
  ): {
    income: number;
    expenses: number;
    savingsRate: number | null;
    expenseCategories: CategorySummary[];
    incomeCategories: CategorySummary[];
  } {
    let income = 0;
    let expenses = 0;
    const expenseByCategory = new Map<number | null, { total: number; count: number }>();
    const incomeByCategory = new Map<number | null, { total: number; count: number }>();

    for (const tx of transactions) {
      const amount = Number(tx.amount) || 0;
      const categoryId = tx.category_id ?? null;

      if (amount >= 0) {
        income += amount;
        const entry = incomeByCategory.get(categoryId) || { total: 0, count: 0 };
        entry.total += amount;
        entry.count++;
        incomeByCategory.set(categoryId, entry);
      } else {
        const absAmount = Math.abs(amount);
        expenses += absAmount;
        const entry = expenseByCategory.get(categoryId) || { total: 0, count: 0 };
        entry.total += absAmount;
        entry.count++;
        expenseByCategory.set(categoryId, entry);
      }
    }

    income = Math.round(income * 100) / 100;
    expenses = Math.round(expenses * 100) / 100;
    const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 10000) / 100 : null;

    const expenseCategories = this.buildCategorySummaries(expenseByCategory, expenses, categoriesMap);
    const incomeCategories = this.buildCategorySummaries(incomeByCategory, income, categoriesMap);

    return { income, expenses, savingsRate, expenseCategories, incomeCategories };
  }

  private buildCategorySummaries(
    byCategory: Map<number | null, { total: number; count: number }>,
    totalAmount: number,
    categoriesMap: Map<number, { name: string; icon: string; icon_color: string }>,
  ): CategorySummary[] {
    const summaries: CategorySummary[] = [];

    for (const [categoryId, data] of byCategory.entries()) {
      const cat = categoryId !== null ? categoriesMap.get(categoryId) : undefined;
      summaries.push({
        category_id: categoryId,
        category_name: cat?.name || (categoryId === null ? 'Sin categoría' : 'Categoría desconocida'),
        category_icon: cat?.icon || 'help-circle',
        category_color: cat?.icon_color || '#6B7280',
        total: Math.round(data.total * 100) / 100,
        percentage: totalAmount > 0 ? Math.round((data.total / totalAmount) * 10000) / 100 : 0,
        transaction_count: data.count,
      });
    }

    return summaries.sort((a, b) => b.total - a.total);
  }
}
