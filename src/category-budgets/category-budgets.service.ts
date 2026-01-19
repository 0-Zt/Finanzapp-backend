import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CreateCategoryBudgetDto } from './dto/create-category-budget.dto';
import { UpdateCategoryBudgetDto } from './dto/update-category-budget.dto';
import { DbPostgresqlService, QueryFilter } from 'src/shared/connection/db.postgresql.service';

export interface BudgetProgress {
  id: number;
  category_id: number;
  category_name: string;
  category_icon: string;
  category_color: string;
  budget_amount: number;
  budget_month: string;
  rollover_enabled: boolean;
  rollover_amount: number;
  effective_budget_amount: number;
  suggested_budget: number | null;
  spent_amount: number;
  remaining_amount: number;
  percentage: number;
  status: 'safe' | 'warning' | 'exceeded';
}

export interface SuggestedBudget {
  category_id: number;
  category_name: string;
  category_icon: string;
  category_color: string;
  average_spent: number;
}

export interface UnbudgetedCategorySummary {
  category_id: number | null;
  category_name: string;
  category_icon: string;
  category_color: string;
  spent_amount: number;
}

export interface BudgetSummary {
  month: string;
  timezone: string;
  warning_threshold: number;
  exceeded_threshold: number;
  total_budget: number;
  total_spent: number;
  unbudgeted_total: number;
  unbudgeted_categories: number;
  top_over_budget: BudgetProgress[];
  suggested_budgets: SuggestedBudget[];
  unbudgeted_breakdown: UnbudgetedCategorySummary[];
  budgets: BudgetProgress[];
}

interface ExpenseCategory {
  id: number;
  name: string;
  icon: string;
  icon_color: string;
}

interface ProfileSettings {
  timezone: string;
  warningThreshold: number;
  exceededThreshold: number;
}

@Injectable()
export class CategoryBudgetsService {
  private readonly logger = new Logger(CategoryBudgetsService.name);
  private readonly defaultWarningThreshold = 80;
  private readonly defaultExceededThreshold = 100;
  private readonly suggestionMonths = 3;

  constructor(private readonly dbService: DbPostgresqlService) {}

  async findAll(userId: string, accessToken?: string, month?: string): Promise<any> {
    try {
      const settings = await this.getProfileSettings(userId, accessToken);
      const monthKey = this.normalizeMonthInput(month, settings.timezone);
      const filters: QueryFilter[] = [
        { column: 'user_id', operator: 'eq', value: userId },
        { column: 'budget_month', operator: 'eq', value: this.toBudgetMonthDate(monthKey) },
      ];

      const budgets = await this.dbService.selectWithFilters(
        'category_budgets',
        filters,
        { orderBy: 'category_id', order: 'asc' },
        accessToken,
      );

      return (budgets || []).map((budget: any) => ({
        ...budget,
        budget_month: this.formatBudgetMonth(budget.budget_month) ?? monthKey,
        rollover_enabled: Boolean(budget.rollover_enabled),
      }));
    } catch (error) {
      this.logger.error('Error al obtener presupuestos', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async getProgress(userId: string, accessToken?: string, month?: string): Promise<BudgetSummary> {
    try {
      const settings = await this.getProfileSettings(userId, accessToken);
      const monthKey = this.normalizeMonthInput(month, settings.timezone);
      const budgetMonthDate = this.toBudgetMonthDate(monthKey);

      const budgets = await this.dbService.selectWithFilters(
        'category_budgets',
        [
          { column: 'user_id', operator: 'eq', value: userId },
          { column: 'budget_month', operator: 'eq', value: budgetMonthDate },
        ],
        { orderBy: 'category_id', order: 'asc' },
        accessToken,
      );

      const categories = (await this.dbService.select(
        'expense_categories',
        {},
        { orderBy: 'name', order: 'asc' },
        accessToken,
      )) as ExpenseCategory[];
      const categoriesMap = new Map<number, ExpenseCategory>(categories.map((category) => [category.id, category]));

      const currentMonthRange = this.getMonthRange(monthKey, settings.timezone);
      const currentMonthExpenses = await this.fetchExpensesForRange(
        userId,
        currentMonthRange,
        accessToken,
      );

      const spentByCategory = this.sumSpentByCategory(currentMonthExpenses);
      const budgetCategoryIds = new Set<number>((budgets || []).map((budget: any) => budget.category_id));
      const unbudgetedSummary = this.buildUnbudgetedSummary(
        spentByCategory,
        budgetCategoryIds,
        categoriesMap,
      );

      const rolloverByCategory = await this.calculateRolloverAmounts(
        userId,
        (budgets || []).filter((budget: any) => budget.rollover_enabled),
        monthKey,
        settings.timezone,
        accessToken,
      );

      const suggestedByCategory = await this.calculateSuggestedBudgets(
        userId,
        monthKey,
        settings.timezone,
        accessToken,
      );

      const budgetProgressList: BudgetProgress[] = (budgets || []).map((budget: any) => {
        const category = categoriesMap.get(budget.category_id);
        const spentAmount = spentByCategory.get(budget.category_id) || 0;
        const budgetAmount = Number.parseFloat(budget.budget_amount);
        const rolloverAmount = rolloverByCategory.get(budget.category_id) || 0;
        const effectiveBudget = budgetAmount + rolloverAmount;
        const remainingAmount = effectiveBudget - spentAmount;
        const percentage = effectiveBudget > 0 ? (spentAmount / effectiveBudget) * 100 : 0;

        let status: 'safe' | 'warning' | 'exceeded';
        if (percentage >= settings.exceededThreshold) {
          status = 'exceeded';
        } else if (percentage >= settings.warningThreshold) {
          status = 'warning';
        } else {
          status = 'safe';
        }

        return {
          id: budget.id,
          category_id: budget.category_id,
          category_name: category?.name || 'Categoria desconocida',
          category_icon: category?.icon || 'help-circle',
          category_color: category?.icon_color || '#6B7280',
          budget_amount: budgetAmount,
          budget_month: this.formatBudgetMonth(budget.budget_month) ?? monthKey,
          rollover_enabled: Boolean(budget.rollover_enabled),
          rollover_amount: Math.round(rolloverAmount * 100) / 100,
          effective_budget_amount: Math.round(effectiveBudget * 100) / 100,
          suggested_budget: suggestedByCategory.get(budget.category_id) ?? null,
          spent_amount: spentAmount,
          remaining_amount: remainingAmount,
          percentage: Math.round(percentage * 100) / 100,
          status,
        };
      });

      const totalBudget = budgetProgressList.reduce((sum, b) => sum + b.effective_budget_amount, 0);
      const totalSpent = budgetProgressList.reduce((sum, b) => sum + b.spent_amount, 0);
      const topOverBudget = budgetProgressList
        .filter((budget) => budget.status === 'exceeded')
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3);

      const suggestedBudgets = this.buildSuggestedBudgetsList(
        suggestedByCategory,
        budgetCategoryIds,
        categoriesMap,
      );

      return {
        month: monthKey,
        timezone: settings.timezone,
        warning_threshold: settings.warningThreshold,
        exceeded_threshold: settings.exceededThreshold,
        total_budget: totalBudget,
        total_spent: totalSpent,
        unbudgeted_total: unbudgetedSummary.total,
        unbudgeted_categories: unbudgetedSummary.count,
        top_over_budget: topOverBudget,
        suggested_budgets: suggestedBudgets,
        unbudgeted_breakdown: unbudgetedSummary.breakdown,
        budgets: budgetProgressList,
      };
    } catch (error) {
      this.logger.error('Error al obtener progreso de presupuestos', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async create(userId: string, createDto: CreateCategoryBudgetDto, accessToken?: string): Promise<any> {
    try {
      const settings = await this.getProfileSettings(userId, accessToken);
      const monthKey = this.normalizeMonthInput(createDto.budget_month, settings.timezone);
      const payload = {
        user_id: userId,
        category_id: createDto.category_id,
        budget_amount: createDto.budget_amount,
        budget_month: this.toBudgetMonthDate(monthKey),
        rollover_enabled: createDto.rollover_enabled ?? false,
      };
      return await this.dbService.insert('category_budgets', payload, accessToken);
    } catch (error) {
      this.logger.error('Error al crear presupuesto', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async update(
    userId: string,
    id: number,
    updateDto: UpdateCategoryBudgetDto,
    accessToken?: string,
  ): Promise<any> {
    try {
      const payload: Record<string, unknown> = {};
      if (updateDto.budget_amount !== undefined) payload.budget_amount = updateDto.budget_amount;
      if (updateDto.rollover_enabled !== undefined) payload.rollover_enabled = updateDto.rollover_enabled;

      return await this.dbService.update(
        'category_budgets',
        payload,
        { id, user_id: userId },
        accessToken,
      );
    } catch (error) {
      this.logger.error('Error al actualizar presupuesto', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async delete(userId: string, id: number, accessToken?: string): Promise<any> {
    try {
      return await this.dbService.delete('category_budgets', { id, user_id: userId }, accessToken);
    } catch (error) {
      this.logger.error('Error al eliminar presupuesto', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  private normalizeMonthInput(month: string | undefined, timeZone: string): string {
    if (!month) {
      return this.getCurrentMonth(timeZone);
    }

    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new BadRequestException('Invalid month format. Use YYYY-MM.');
    }

    return month;
  }

  private getCurrentMonth(timeZone: string): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
    });
    const parts = formatter.formatToParts(new Date());
    const year = parts.find((part) => part.type === 'year')?.value ?? `${new Date().getUTCFullYear()}`;
    const month = parts.find((part) => part.type === 'month')?.value ?? `${new Date().getUTCMonth() + 1}`.padStart(2, '0');
    return `${year}-${month}`;
  }

  private toBudgetMonthDate(month: string): string {
    return `${month}-01`;
  }

  private formatBudgetMonth(value?: string | null): string | null {
    if (!value) return null;
    return value.slice(0, 7);
  }

  private parseMonth(month: string): { year: number; monthIndex: number } {
    const [yearStr, monthStr] = month.split('-');
    const year = Number.parseInt(yearStr, 10);
    const monthIndex = Number.parseInt(monthStr, 10) - 1;
    if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || monthIndex < 0 || monthIndex > 11) {
      throw new BadRequestException('Invalid month format. Use YYYY-MM.');
    }
    return { year, monthIndex };
  }

  private getMonthRange(month: string, timeZone: string): { start: Date; end: Date } {
    const { year, monthIndex } = this.parseMonth(month);
    const start = this.makeZonedDate(year, monthIndex, 1, 0, 0, 0, 0, timeZone);
    const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    const end = this.makeZonedDate(year, monthIndex, lastDay, 23, 59, 59, 999, timeZone);
    return { start, end };
  }

  private makeZonedDate(
    year: number,
    monthIndex: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
    millisecond: number,
    timeZone: string,
  ): Date {
    const utcDate = new Date(Date.UTC(year, monthIndex, day, hour, minute, second, millisecond));
    const offset = this.getTimeZoneOffset(utcDate, timeZone);
    return new Date(utcDate.getTime() - offset);
  }

  private getTimeZoneOffset(date: Date, timeZone: string): number {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const parts = formatter.formatToParts(date);
      const values: Record<string, string> = {};
      for (const part of parts) {
        values[part.type] = part.value;
      }
      const asUtc = Date.UTC(
        Number.parseInt(values.year, 10),
        Number.parseInt(values.month, 10) - 1,
        Number.parseInt(values.day, 10),
        Number.parseInt(values.hour, 10),
        Number.parseInt(values.minute, 10),
        Number.parseInt(values.second, 10),
      );
      return asUtc - date.getTime();
    } catch {
      return 0;
    }
  }

  private sumSpentByCategory(transactions: any[]): Map<number | null, number> {
    const totals = new Map<number | null, number>();
    for (const transaction of transactions) {
      const categoryId = transaction.category_id ?? null;
      const amount = Math.abs(Number(transaction.amount) || 0);
      if (!amount) continue;
      totals.set(categoryId, (totals.get(categoryId) || 0) + amount);
    }
    return totals;
  }

  private buildUnbudgetedSummary(
    spentByCategory: Map<number | null, number>,
    budgetCategoryIds: Set<number>,
    categoriesMap: Map<number, ExpenseCategory>,
  ): { total: number; count: number; breakdown: UnbudgetedCategorySummary[] } {
    let total = 0;
    const breakdown: UnbudgetedCategorySummary[] = [];

    for (const [categoryId, spent] of spentByCategory.entries()) {
      if (categoryId !== null && budgetCategoryIds.has(categoryId)) {
        continue;
      }

      total += spent;
      const category = categoryId !== null ? categoriesMap.get(categoryId) : undefined;
      breakdown.push({
        category_id: categoryId,
        category_name: category?.name || (categoryId === null ? 'Sin categoria' : 'Categoria desconocida'),
        category_icon: category?.icon || 'help-circle',
        category_color: category?.icon_color || '#6B7280',
        spent_amount: spent,
      });
    }

    breakdown.sort((a, b) => b.spent_amount - a.spent_amount);

    return {
      total,
      count: breakdown.length,
      breakdown: breakdown.slice(0, 5),
    };
  }

  private async calculateRolloverAmounts(
    userId: string,
    rolloverBudgets: any[],
    month: string,
    timeZone: string,
    accessToken?: string,
  ): Promise<Map<number, number>> {
    const rolloverByCategory = new Map<number, number>();
    const rolloverCategoryIds = rolloverBudgets.map((budget) => budget.category_id);

    if (!rolloverCategoryIds.length) {
      return rolloverByCategory;
    }

    const previousMonth = this.getPreviousMonth(month, 1);
    const previousMonthDate = this.toBudgetMonthDate(previousMonth);
    const previousBudgets = await this.dbService.selectWithFilters(
      'category_budgets',
      [
        { column: 'user_id', operator: 'eq', value: userId },
        { column: 'budget_month', operator: 'eq', value: previousMonthDate },
        { column: 'category_id', operator: 'in', value: rolloverCategoryIds },
      ],
      {},
      accessToken,
    );

    const previousBudgetMap = new Map<number, number>();
    for (const budget of previousBudgets || []) {
      previousBudgetMap.set(budget.category_id, Number.parseFloat(budget.budget_amount));
    }

    const previousRange = this.getMonthRange(previousMonth, timeZone);
    const previousExpenses = await this.fetchExpensesForRange(userId, previousRange, accessToken);
    const previousSpent = this.sumSpentByCategory(previousExpenses);

    for (const categoryId of rolloverCategoryIds) {
      const budgetAmount = previousBudgetMap.get(categoryId);
      if (!budgetAmount) continue;
      const spentAmount = previousSpent.get(categoryId) || 0;
      const remaining = budgetAmount - spentAmount;
      if (remaining > 0) {
        rolloverByCategory.set(categoryId, Math.round(remaining * 100) / 100);
      }
    }

    return rolloverByCategory;
  }

  private async calculateSuggestedBudgets(
    userId: string,
    month: string,
    timeZone: string,
    accessToken?: string,
  ): Promise<Map<number, number>> {
    const suggestions = new Map<number, number>();

    if (this.suggestionMonths <= 0) {
      return suggestions;
    }

    const startMonth = this.getPreviousMonth(month, this.suggestionMonths);
    const endMonth = this.getPreviousMonth(month, 1);
    const startRange = this.getMonthRange(startMonth, timeZone);
    const endRange = this.getMonthRange(endMonth, timeZone);

    const expenses = await this.fetchExpensesForRange(
      userId,
      { start: startRange.start, end: endRange.end },
      accessToken,
    );

    const totals = this.sumSpentByCategory(expenses);
    for (const [categoryId, spent] of totals.entries()) {
      if (categoryId === null) continue;
      const average = spent / this.suggestionMonths;
      if (average > 0) {
        suggestions.set(categoryId, Math.round(average * 100) / 100);
      }
    }

    return suggestions;
  }

  private buildSuggestedBudgetsList(
    suggestedByCategory: Map<number, number>,
    budgetCategoryIds: Set<number>,
    categoriesMap: Map<number, ExpenseCategory>,
  ): SuggestedBudget[] {
    const suggestedBudgets: SuggestedBudget[] = [];
    for (const [categoryId, average] of suggestedByCategory.entries()) {
      if (budgetCategoryIds.has(categoryId)) continue;
      const category = categoriesMap.get(categoryId);
      suggestedBudgets.push({
        category_id: categoryId,
        category_name: category?.name || 'Categoria desconocida',
        category_icon: category?.icon || 'help-circle',
        category_color: category?.icon_color || '#6B7280',
        average_spent: average,
      });
    }

    return suggestedBudgets.sort((a, b) => b.average_spent - a.average_spent);
  }

  private getPreviousMonth(month: string, offset: number): string {
    const { year, monthIndex } = this.parseMonth(month);
    const date = new Date(Date.UTC(year, monthIndex - offset, 1));
    const newYear = date.getUTCFullYear();
    const newMonth = `${date.getUTCMonth() + 1}`.padStart(2, '0');
    return `${newYear}-${newMonth}`;
  }

  private async fetchExpensesForRange(
    userId: string,
    range: { start: Date; end: Date },
    accessToken?: string,
  ): Promise<any[]> {
    const filters: QueryFilter[] = [
      { column: 'user_id', operator: 'eq', value: userId },
      { column: 'transaction_date', operator: 'gte', value: range.start.toISOString() },
      { column: 'transaction_date', operator: 'lte', value: range.end.toISOString() },
      { column: 'status', operator: 'eq', value: 'completed' },
      { column: 'amount', operator: 'lt', value: 0 },
    ];

    return await this.dbService.selectWithFilters('transactions', filters, {}, accessToken);
  }

  private async getProfileSettings(userId: string, accessToken?: string): Promise<ProfileSettings> {
    const profileData = await this.dbService.select('user_profiles', { id: userId }, {}, accessToken);
    const profile = profileData?.[0];
    const timeZone = this.normalizeTimeZone(profile?.timezone);
    const thresholds = this.normalizeThresholds(profile);

    return {
      timezone: timeZone,
      warningThreshold: thresholds.warning,
      exceededThreshold: thresholds.exceeded,
    };
  }

  private normalizeTimeZone(timeZone?: string | null): string {
    if (!timeZone) return 'UTC';
    try {
      new Intl.DateTimeFormat('en-US', { timeZone });
      return timeZone;
    } catch {
      return 'UTC';
    }
  }

  private normalizeThresholds(profile: any): { warning: number; exceeded: number } {
    const warning = this.clampThreshold(profile?.budget_warning_threshold, this.defaultWarningThreshold);
    const exceeded = this.clampThreshold(profile?.budget_exceeded_threshold, this.defaultExceededThreshold);

    if (warning >= exceeded) {
      return { warning: this.defaultWarningThreshold, exceeded: this.defaultExceededThreshold };
    }

    return { warning, exceeded };
  }

  private clampThreshold(value: number | null | undefined, fallback: number): number {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return fallback;
    }
    return Math.min(100, Math.max(0, value));
  }
}
